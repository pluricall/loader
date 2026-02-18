import { LeadsRepository } from "../../repositories/leads-repository";
import { AltitudeCreateContact } from "../altitude/create-contact";
import { AltitudeUploadContact } from "../altitude/upload-contact.ts";
import { AltitudeApiError } from "../errors/altitude-error";

export interface LeadLoadResult {
  lead: any;
  success: boolean;
  error?: string;
}

export class LoadLeadsUseCase {
  private MAX_PARALLEL = 500;

  constructor(
    private leadsRepository: LeadsRepository,
    private createContact: AltitudeCreateContact,
    private uploadContact: AltitudeUploadContact,
  ) {}

  async execute(clientName: string, leads: any[]): Promise<LeadLoadResult[]> {
    const client = await this.leadsRepository.findClientByName(clientName);

    if (!client) {
      throw new Error("Client not found!");
    }

    const config = await this.leadsRepository.getAltitudeConfig(clientName);
    const mapping = await this.leadsRepository.getFieldMapping(clientName);

    if (!config) throw new Error("Missing Altitude configuration");
    if (!mapping || mapping.length === 0)
      throw new Error("Missing field mapping");

    const results: LeadLoadResult[] = [];

    const validatedLeads = leads.map((lead) => {
      const errors: string[] = [];

      for (const map of mapping) {
        if (map.is_required && !lead[map.source_field]) {
          errors.push(`Missing required field: ${map.source_field}`);
        }
      }

      const allowedFields = new Set(mapping.map((m) => m.source_field));
      const extraFields = Object.keys(lead).filter(
        (k) => !allowedFields.has(k),
      );
      if (extraFields.length > 0) {
        errors.push(`Unknown fields sent: ${extraFields.join(", ")}`);
      }

      return { lead, errors };
    });

    // separa leads válidos e inválidos
    const validLeads = validatedLeads.filter((l) => l.errors.length === 0);
    const invalidLeads = validatedLeads.filter((l) => l.errors.length > 0);

    // adiciona invalidos direto nos resultados
    for (const il of invalidLeads) {
      results.push({
        lead: il.lead,
        success: false,
        error: il.errors.join("; "),
      });
      await this.leadsRepository.saveLog({
        client_name: clientName,
        received_payload: JSON.stringify(il.lead),
        altitude_payload: "{}",
        altitude_response: null,
        success: false,
        error_message: il.errors.join("; "),
      });
    }

    if (validLeads.length === 0) return results;

    // decide se unitário ou massivo
    if (validLeads.length === 1) {
      const lead = validLeads[0].lead;

      const attributes = mapping.map((m) => ({
        discriminator: "Attribute",
        Name: m.altitude_field,
        Value: lead[m.source_field] ?? "",
        IsAnonymized: false,
      }));

      const payload = {
        campaignName: config.campaign_name,
        contactCreateRequest: {
          discriminator: "ContactCreateRequest",
          Status: config.default_status,
          ContactListName: { RequestType: "Set", Value: config.contact_list },
          Attributes: attributes,
        },
      };

      try {
        const response = await this.createContact.execute({
          payload,
          environment: client.environment,
        });

        results.push({ lead, success: true });
        await this.leadsRepository.saveLog({
          client_name: clientName,
          received_payload: JSON.stringify(lead),
          altitude_payload: JSON.stringify(payload),
          altitude_response: JSON.stringify(response),
          success: true,
        });
      } catch (err: any) {
        const errorMessage =
          err instanceof AltitudeApiError
            ? `Altitude: ${err.message}`
            : err.message;

        results.push({ lead, success: false, error: errorMessage });
        await this.leadsRepository.saveLog({
          client_name: clientName,
          received_payload: JSON.stringify(lead),
          altitude_payload: JSON.stringify(payload),
          altitude_response: null,
          success: false,
          error_message: errorMessage,
        });
      }

      return results;
    }

    // === MASSIVO ===
    const batches: any[][] = [];
    for (let i = 0; i < validLeads.length; i += this.MAX_PARALLEL) {
      batches.push(validLeads.slice(i, i + this.MAX_PARALLEL));
    }

    for (const batch of batches) {
      const requests = batch.map(({ lead }) => {
        const attributes = mapping.map((m) => ({
          discriminator: "Attribute",
          Name: m.altitude_field,
          Value: lead[m.source_field] ?? "",
          IsAnonymized: false,
        }));

        return {
          RequestType: "Insert",
          Value: {
            discriminator: "ContactUploadRequest",
            ContactStatus: { Value: config.default_status },
            ContactListName: {
              RequestType: "Set",
              Value: config.contact_list,
            },
            Attributes: attributes,
          },
        };
      });

      try {
        const resp = await this.uploadContact.execute({
          payload: {
            campaignName: config.campaign_name,
            requests,
          },
          environment: client.environment,
        });

        for (let i = 0; i < batch.length; i++) {
          results.push({ lead: batch[i].lead, success: true });
          await this.leadsRepository.saveLog({
            client_name: clientName,
            received_payload: JSON.stringify(batch[i].lead),
            altitude_payload: JSON.stringify(requests[i]),
            altitude_response: JSON.stringify(resp),
            success: true,
          });
        }
      } catch (err: any) {
        const errorMessage =
          err instanceof AltitudeApiError
            ? `Altitude: ${err.details?.message || err.message}`
            : err.message;

        for (const b of batch) {
          results.push({ lead: b.lead, success: false, error: errorMessage });
          await this.leadsRepository.saveLog({
            client_name: clientName,
            received_payload: JSON.stringify(b.lead),
            altitude_payload: JSON.stringify(requests),
            altitude_response: null,
            success: false,
            error_message: errorMessage,
          });
        }
      }
    }

    return results;
  }
}
