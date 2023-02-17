import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StoreUserValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string({ trim: true }),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email ' }),
    ]),
    lang: schema.string(),
    password: schema.string(),
    number: schema.string.optional({ trim: true }, [rules.mobile()]),
    photo: schema.file.optional({
      size: '2mb',
      extnames: ['jpg', 'png'],
    }),
    isActivated: schema.boolean(),
    isAdmin: schema.boolean(),
    maxProjects: schema.number.optional(),
    maxDevices: schema.number.optional(),
    maxVariables: schema.number.optional(),
    maxMacros: schema.number.optional(),
  })
  public messages = {}
}
