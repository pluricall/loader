import { AltitudeCreateContact } from "../../../../use-cases/altitude/create-contact";
import { AltitudeUploadContact } from "../../../../use-cases/altitude/upload-contact.ts";
import { AltitudeApiError } from "../../../../use-cases/errors/altitude-error";
import { AltitudeEnvironment } from "../../../../utils/resolve-altitude-config";
import { LeadIntegration } from "../../domain/entities/lead-integration";
import { LeadLogsRepository } from "../../domain/repositories/lead-logs-repository";
import { LeadMappingRepository } from "../../domain/repositories/lead-mapping-repository";

export interface LeadLoadResult {
  lead: any;
  success: boolean;
  error?: string;
}

export class LoadLeadsUseCase {
  private MAX_PARALLEL = 500;

  constructor(
    private leadLogsRepository: LeadLogsRepository,
    private leadMappingRepository: LeadMappingRepository,
    private createContact: AltitudeCreateContact,
    private uploadContact: AltitudeUploadContact,
  ) {}

  async execute(
    client: LeadIntegration,
    leads: any[],
  ): Promise<LeadLoadResult[]> {
    console.log("CLIENT ID RECEBIDO:", client);
    const today = new Date();
    const dataload = today.toISOString().split("T")[0]; // '2026-02-19'

    const mapping = await this.leadMappingRepository.findByLeadConfigId(
      client.id,
    );

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

    const validLeads = validatedLeads.filter((l) => l.errors.length === 0);
    const invalidLeads = validatedLeads.filter((l) => l.errors.length > 0);

    for (const il of invalidLeads) {
      results.push({
        lead: il.lead,
        success: false,
        error: il.errors.join("; "),
      });
      await this.leadLogsRepository.save({
        lead_config_id: client.id,
        received_payload: JSON.stringify(il.lead),
        altitude_payload: "{}",
        altitude_response: null,
        success: false,
        error_message: il.errors.join("; "),
      });
    }

    if (validLeads.length === 0) return results;

    if (validLeads.length === 1) {
      const lead = validLeads[0].lead;

      const attributes = mapping.map((m) => ({
        discriminator: "Attribute",
        Name: m.altitude_field,
        Value: lead[m.source_field] ?? "",
        IsAnonymized: false,
      }));

      attributes.push({
        discriminator: "Attribute",
        Name: "dataload",
        Value: dataload,
        IsAnonymized: false,
      });

      const payload = {
        campaignName: client.campaign_name,
        contactCreateRequest: {
          discriminator: "ContactCreateRequest",
          Status: client.default_status,
          ContactListName: { RequestType: "Set", Value: client.contact_list },
          Attributes: attributes,
        },
      };

      try {
        const response = await this.createContact.execute({
          payload,
          environment: client.environment as AltitudeEnvironment,
        });

        results.push({ lead, success: true });
        await this.leadLogsRepository.save({
          lead_config_id: client.id,
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
        await this.leadLogsRepository.save({
          lead_config_id: client.id,
          received_payload: JSON.stringify(lead),
          altitude_payload: JSON.stringify(payload),
          altitude_response: null,
          success: false,
          error_message: errorMessage,
        });
      }

      return results;
    }

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

        attributes.push({
          discriminator: "Attribute",
          Name: "dataload",
          Value: dataload,
          IsAnonymized: false,
        });

        return {
          RequestType: "Insert",
          Value: {
            discriminator: "ContactUploadRequest",
            ContactStatus: { Value: client.default_status },
            ContactListName: {
              RequestType: "Set",
              Value: client.contact_list,
            },
            Attributes: attributes,
          },
        };
      });

      try {
        const resp = await this.uploadContact.execute({
          payload: {
            campaignName: client.campaign_name,
            requests,
          },
          environment: client.environment as AltitudeEnvironment,
        });

        for (let i = 0; i < batch.length; i++) {
          results.push({ lead: batch[i].lead, success: true });
          await this.leadLogsRepository.save({
            lead_config_id: client.id,
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
          await this.leadLogsRepository.save({
            lead_config_id: client.id,
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
