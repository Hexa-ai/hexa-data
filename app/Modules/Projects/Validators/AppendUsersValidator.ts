import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AppendUsersValidator {
  constructor(protected ctx: HttpContextContract) {}
  public refs = schema.refs({
    projectId: this.ctx.params.id,
  })
  public schema = schema.create({
    users: schema.array().members(
      schema.object().members({
        id: schema.number([
          rules.exists({ table: 'users', column: 'id ' }),
          rules.unique({
            table: 'project_user',
            column: 'user_id ',
            where: { project_id: this.refs.projectId },
          }),
        ]),
        role: schema.number()
      })
    ),
  })
  public messages = {}
}
