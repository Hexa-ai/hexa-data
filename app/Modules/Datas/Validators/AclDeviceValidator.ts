import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthDeviceValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({

    access: schema.number(),
    username: schema.string(),
    clientId: schema.string(),
    ipaddr: schema.string(),
    topic: schema.string(),
    mountpoint: schema.string(),


  })
  public messages = {}
}
