import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Modules/Users/Models/User'
import Role from '../../Projects/Contracts/enums/Roles'

export default class DocumentPolicy extends BasePolicy {
  public async before(user: User | null) {
    if (user && user.isAdmin) {
      return true
    }
  }
  public async index(user: User, projectId: number) {
    return await user.hasProjectRights(projectId)
  }
  public async destroy(user: User, projectId: number) {
    return await user.hasProjectRights(projectId, Role.EDITOR)
  }
  public async store(user: User, projectId: number) {
    return await user.hasProjectRights(projectId)
  }
}
