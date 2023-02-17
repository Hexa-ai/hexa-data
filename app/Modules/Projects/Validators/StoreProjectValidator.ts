import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StoreProjectValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.unique({ table: 'projects', column: 'name ' })]),
    description: schema.string({ trim: true }),
    adress: schema.string.optional(),
    lat: schema.number.optional(),
    long: schema.number.optional(),
    photo: schema.file.optional({
      size: '2mb',
      extnames: ['jpg', 'png'],
    }),
    l1:schema.string({}, [
      rules.alpha(),
      rules.minLength(1),
      rules.maxLength(2)
    ]),
    l2:schema.string({}, [
      rules.alpha(),
      rules.minLength(1),
      rules.maxLength(2)
    ]),
    l3:schema.string({}, [
      rules.alpha(),
      rules.minLength(1),
      rules.maxLength(2)
    ]),
  })
  public messages = {}
}
