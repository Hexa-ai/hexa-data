import { schema, rules, ParsedTypedSchema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateTagValidator {
  constructor(protected ctx: HttpContextContract) {
    this.schema = UpdateTagValidator.buildSchema(this.refs.id.value)
  }
  public data = {
    name: this.ctx.request.input('name'),
    descriptionL1: this.ctx.request.input('descriptionL1'),
    descriptionL2: this.ctx.request.input('descriptionL2'),
    descriptionL3: this.ctx.request.input('descriptionL3'),
    unit: this.ctx.request.input('unit'),
    type: this.ctx.request.input('type'),
    valueType: this.ctx.request.input('valueType'),
    minTreshold: this.ctx.request.input('minTreshold'),
    maxTreshold: this.ctx.request.input('maxTreshold'),
    triggerType: this.ctx.request.input('triggerType'),
    alarm: this.ctx.request.input('alarm'),
    script: this.ctx.request.input('script'),
    scriptOutput: this.ctx.request.input('scriptOutput'),
    scriptInterval: this.ctx.request.input('scriptInterval'),
    scriptLastExec: this.ctx.request.input('scriptLastExec'),
    projectId: this.ctx.params.projectId,
    deviceId: this.ctx.request.input('deviceId'),
    physicalUnit: this.ctx.request.input('physicalUnit'),
  }
  public schema: ParsedTypedSchema<any>

  public static buildSchema(id: number) {
    return schema.create({
      name: schema.string({ trim: true }),
      descriptionL1: schema.string.optional({ trim: true }),
      descriptionL2: schema.string.optional({ trim: true }),
      descriptionL3: schema.string.optional({ trim: true }),
      unit: schema.string.optional(),
      type: schema.number(),
      valueType: schema.number.optional([rules.requiredWhen('type', '=', '1')]),
      alarm: schema.boolean.optional(),
      minTreshold: schema.number.optional([
        rules.requiredWhen('alarm', '=', true),
        rules.requiredWhen('valueType', 'in', ['2', '3']),
      ]),
      maxTreshold: schema.number.optional([
        rules.requiredWhen('alarm', '=', true),
        rules.requiredWhen('valueType', 'in', ['2', '3']),
      ]),
      triggerType: schema.enum.optional(['rising', 'falling'] as const),
      script: schema.string.optional(),
      scriptOutput: schema.string.optional(),
      scriptInterval: schema.number.optional(),
      scriptLastExec: schema.date.optional(),
      projectId: schema.number.optional(),
      deviceId: schema.number.optional([
        rules.requiredWhen('type', '=', '1'),
        rules.exists({ table: 'devices', column: 'id' }),
        rules.exists({
          table: 'tags',
          column: 'device_id',
          where: {
            id: id,
          },
        }),
      ]),
      physicalUnit: schema.string.optional(),
    })
  }
  public refs = schema.refs({
    id: <number>this.ctx.params.id!,
  })
  public messages = {}
}
