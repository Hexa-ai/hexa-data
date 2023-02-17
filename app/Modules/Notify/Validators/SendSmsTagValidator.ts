import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SendSmsValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    tag: schema.string(),
    message: schema.string(),
  })

  public messages: CustomMessages = {}
}
