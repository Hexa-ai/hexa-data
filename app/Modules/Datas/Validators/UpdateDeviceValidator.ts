import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateDeviceValidator {
  constructor(protected ctx: HttpContextContract) {}
  public refs = schema.refs({
    projectId: this.ctx.params.projectId,
    id: this.ctx.params.id,
  })
  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.unique({
        table: 'devices', column: 'name ',
        whereNot: { id: this.refs.id },
        where: { project_id: this.refs.projectId },
      }),
    ]),
    clientId: schema.string({}, [
      rules.unique({
        table: 'devices', column: 'client_id ',
        whereNot: { id: this.refs.id },
      }),
    ]),
    description: schema.string.optional({ trim: true }),
    adress: schema.string.optional(),
    lat: schema.number.optional(),
    long: schema.number.optional(),
    username: schema.string.optional(),
    password: schema.string.optional(),
    dashboardId: schema.number.optional(),


  })
  public messages = {}
}
