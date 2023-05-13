import { schema, rules, ParsedTypedSchema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StoreTagValidator {
  constructor(protected ctx: HttpContextContract) {
    this.schema = StoreTagValidator.buildSchema(this.refs.projectId.value)
  }
  public data = {
    name: this.ctx.request.input('name'),
    descriptionL1: this.ctx.request.input('descriptionL1'),
    descriptionL2: this.ctx.request.input('descriptionL2'),
    descriptionL3: this.ctx.request.input('descriptionL3'),
    unit: this.ctx.request.input('unit'),
    type: this.ctx.request.input('type'),
    valueType: this.ctx.request.input('valueType'),
    alarm: this.ctx.request.input('alarm'),
    minTreshold: this.ctx.request.input('minTreshold'),
    maxTreshold: this.ctx.request.input('maxTreshold'),
    triggerType: this.ctx.request.input('triggerType'),
    script: this.ctx.request.input('script'),
    scriptOutput: this.ctx.request.input('scriptOutput'),
    scriptInterval: this.ctx.request.input('scriptInterval'),
    scriptLast_exec: this.ctx.request.input('scriptLast_exec'),
    projectId: this.ctx.params.projectId,
    deviceId: this.ctx.request.input('deviceId'),
    physicalUnit: this.ctx.request.input('physicalUnit'),
    settings: this.ctx.request.input('settings'),
  }
  public schema: ParsedTypedSchema<any>

  public static buildSchema(id: number) {
    return schema.create({
      name: schema.string({ trim: true }, [
        rules.unique({ table: 'tags', column: 'name ', where: { project_id: id } }),
      ]),

      descriptionL1: schema.string.optional({ trim: true }),
      descriptionL2: schema.string.optional({ trim: true }),
      descriptionL3: schema.string.optional({ trim: true }),
      unit: schema.string.optional(),
      type: schema.number(),
      valueType: schema.number.optional([rules.requiredWhen('type', '=', '1')]),
      alarm: schema.boolean.optional(),
      minTreshold: schema.number.optional([]),
      maxTreshold: schema.number.optional([]),
      triggerType: schema.enum.optional(['rising', 'falling'] as const),
      script: schema.string.optional(),
      scriptOutput: schema.string.optional(),
      scriptInterval: schema.number.optional(),
      scriptLast_exec: schema.date.optional(),
      projectId: schema.number.optional(),
      deviceId: schema.number.optional([
        rules.requiredWhen('type', '=', '1'),
        rules.exists({ table: 'devices', column: 'id' }),
      ]),
      physicalUnit: schema.string.optional(),
      settings: schema.string.optional(),
    })
  }
  public refs = schema.refs({
    projectId: this.ctx.params.projectId,
  })
  public messages = {}
}
