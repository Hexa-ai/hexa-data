import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StoreProjectValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.unique({ table: 'projects', column: 'name ' })]),
    description: schema.string({ trim: true }),
    photo: schema.file.optional({
      size: '2mb',
      extnames: ['jpg', 'png'],
    }),
  })
  public messages = {}
}
