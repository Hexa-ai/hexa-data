import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StoreDeviceValidator {
  constructor(protected ctx: HttpContextContract) {}
  public refs = schema.refs({
    projectId: this.ctx.params.projectId,
  })
  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.unique({ table: 'devices', column: 'name ', where: { project_id: this.refs.projectId } }),
    ]),
    namespace: schema.string({ trim: true }, [
      rules.unique({ table: 'devices', column: 'namespace ' }),
    ]),
    description: schema.string.optional({ trim: true }),
    adress: schema.string.optional(),
    lat: schema.number.optional(),
    long: schema.number.optional(),
    clientId: schema.string({}, [
      rules.unique({ table: 'devices', column: 'client_id '}),
    ]),
    username: schema.string(),
    password: schema.string(),
    dashboardId: schema.number.optional(),

  })
  public messages = {}
}
