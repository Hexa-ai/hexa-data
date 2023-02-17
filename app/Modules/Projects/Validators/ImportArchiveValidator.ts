import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ImportArchiveValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    photo: schema.file.optional({
      size: '100gb',
      extnames: ['zip'],
    }),
  })
  public messages = {}
}
