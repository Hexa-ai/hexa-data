import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateDashboardValidator {
  constructor(protected ctx: HttpContextContract) {}
  public refs = schema.refs({
    projectId: this.ctx.params.projectId,
    id: this.ctx.params.id,
  })
  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.unique({
        table: 'dashboards', column: 'name ',
        whereNot: { id: this.refs.id },
        where: { project_id: this.refs.projectId },
      }),
    ]),
    descriptionL1: schema.string.optional({ trim: true }),
    descriptionL2: schema.string.optional({ trim: true }),
    descriptionL3: schema.string.optional({ trim: true }),
    type: schema.string.optional(),
    enableImgBg: schema.boolean.optional(),
    colorBg: schema.string.optional(),
    body: schema.string.optional(),
    stared: schema.boolean.optional()
  })
  public messages = {}
}
