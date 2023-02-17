import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StoreDashboardValidator {
  constructor(protected ctx: HttpContextContract) {}
  public refs = schema.refs({
    projectId: this.ctx.params.projectId,
  })
  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.unique({ table: 'dashboards', column: 'name ', where: { project_id: this.refs.projectId } }),
    ]),
    descriptionL1: schema.string.optional({ trim: true }),
    descriptionL2: schema.string.optional({ trim: true }),
    descriptionL3: schema.string.optional({ trim: true }),
    type: schema.string(),
    enableImgBg: schema.boolean(),
    colorBg: schema.string.optional(),
    body: schema.string.optional(),
    stared: schema.boolean.optional(),
  })
  public messages = {}
}
