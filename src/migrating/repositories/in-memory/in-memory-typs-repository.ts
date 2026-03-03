import { Prisma, Typ, EntityNameEnum, LoadingModeEnum } from "@prisma/client";
import { TypsRepository } from "../typs-repository";
import { randomUUID } from "crypto";
import { JsonValue } from "@prisma/client/runtime/library";

function resolveField<T>(
  field: T | { set?: T } | null | undefined,
  current: T,
): T {
  if (field === undefined || field === null) return current;
  if (typeof field === "object" && "set" in field) {
    return (field.set ?? current) as T;
  }
  return field as T;
}

export class InMemoryTypsRepository implements TypsRepository {
  private items: Typ[] = [];

  async create(data: Prisma.TypCreateInput): Promise<Typ> {
    const newTyp: Typ = {
      id: randomUUID(),
      name: data.name as string,
      separator: (data.separator as string) ?? "|",
      entity_name: data.entity_name as EntityNameEnum,
      loading_mode: data.loading_mode as LoadingModeEnum,
      fields: (data.fields as string[]) ?? [],
      fixed_fields: (data.fixed_fields as JsonValue) ?? {},
      created_at: new Date(),
      updated_at: null,
    };

    this.items.push(newTyp);
    return newTyp;
  }

  async searchMany(): Promise<Typ[]> {
    return this.items;
  }

  async findById(id: string): Promise<Typ | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByName(name: string): Promise<Typ | null> {
    return this.items.find((item) => item.name === name) ?? null;
  }

  async update(id: string, data: Prisma.TypUpdateInput): Promise<Typ> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Typ not found");

    const current = this.items[index];

    const updated: Typ = {
      ...current,
      name: resolveField(data.name, current.name),
      separator: resolveField(data.separator, current.separator),
      entity_name: resolveField(data.entity_name, current.entity_name),
      loading_mode: resolveField(data.loading_mode, current.loading_mode),
      fields: resolveField(data.fields, current.fields),
      fixed_fields: resolveField(
        data.fixed_fields as JsonValue,
        current.fixed_fields,
      ),
      updated_at: new Date(),
    };

    this.items[index] = updated;
    return updated;
  }

  async remove(id: string): Promise<Typ> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Typ not found");

    const [removed] = this.items.splice(index, 1);
    return removed;
  }
}
