import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SendEmailValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    tag: schema.string(),
    subject: schema.string(),
    message: schema.string(),
    attachmentId: schema.number.optional(),
    attachmentName: schema.string.optional(),
  })

  public messages: CustomMessages = {}
}
