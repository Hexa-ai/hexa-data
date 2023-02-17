import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SendSmsValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    receivers: schema.array().members(
      schema.string([
        rules.mobile({
          locale: ['fr-FR'],
        })
      ])
    ),
    message: schema.string(),
  })

  public messages: CustomMessages = {}
}
