import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}
  public refs = schema.refs({
    id: this.ctx.params.id,
  })
  public schema = schema.create({
    name: schema.string({ trim: true }),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email ', whereNot: { id: this.refs.id } }),
    ]),
    lang: schema.string(),
    password: schema.string.optional(),
    number: schema.string.optional({ trim: true }, [rules.mobile()]),
    photo: schema.file.optional({
      size: '2mb',
      extnames: ['jpg', 'png'],
    }),
    isActivated: schema.boolean.optional(),
    isAdmin: schema.boolean.optional(),
    maxProjects: schema.number.optional(),
    maxDevices: schema.number.optional(),
    maxVariables: schema.number.optional(),
    maxMacros: schema.number.optional(),
  })
  public messages = {}
}
