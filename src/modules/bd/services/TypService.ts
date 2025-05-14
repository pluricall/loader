import { AppError } from '../../../errors/AppError'
import { sourceModelInstance, typModelInstance } from '../models/instances'
import { SourceModel } from '../models/SourceModel'
import { TypModel } from '../models/TypModel'
import { TypBodyRequest } from '../schemas/TypSchema'

export class TypService {
  constructor(
    private typModel: TypModel = typModelInstance,
    private sourceModel: SourceModel = sourceModelInstance,
  ) {}

  async create(data: TypBodyRequest) {
    const nameExists = await this.typModel.getByName(data.name)
    if (nameExists) {
      throw AppError.badRequest('Já existe um typ com esse nome.')
    }

    const typ = await this.typModel.create(data)

    return typ
  }

  async getAll() {
    const typ = await this.typModel.getAll()
    return { typs: typ }
  }

  async getById(id: string) {
    const typ = await this.typModel.getById(id)
    if (!typ) {
      throw AppError.notFound('Typ não encontrado.')
    }
    return typ
  }

  async update(id: string, data: TypBodyRequest) {
    const typ = await this.typModel.getById(id)

    if (!typ) {
      throw AppError.notFound('Typ não encontrado para atualização.')
    }

    return this.typModel.update(id, data)
  }

  async delete(id: string) {
    const typ = await this.typModel.getById(id)
    if (!typ) {
      throw AppError.notFound('Typ não encontrado para exclusão.')
    }

    return this.typModel.delete(id)
  }
}
