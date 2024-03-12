import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}
  public refs = schema.refs({
    id: this.ctx.params.id,
  })
  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.unique({ table: 'projects', column: 'name ', whereNot: { id: this.refs.id } }),
    ]),
    description: schema.string({ trim: true }),
    photo: schema.file.optional({
      size: '2mb',
      extnames: ['jpg', 'png'],
    }),
  })
  public messages = {}
}
