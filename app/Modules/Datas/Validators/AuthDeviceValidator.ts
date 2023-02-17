import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthDeviceValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({

    clientId: schema.string(),
    username: schema.string(),
    password: schema.string(),

  })
  public messages = {}
}
