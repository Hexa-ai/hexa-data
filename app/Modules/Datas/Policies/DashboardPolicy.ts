import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Modules/Users/Models/User'
import Role from '../../Projects/Contracts/enums/Roles'

export default class DashboardPolicy extends BasePolicy {
  public async before(user: User | null) {
    if (user && user.isAdmin) {
      return true
    }
  }
  public async exec(user: User, projectId: number) {
    return await user.hasProjectRights(projectId)
  }
  public async index(user: User, projectId: number) {
    return await user.hasProjectRights(projectId)
  }
  public async show(user: User, projectId: number) {
    return await user.hasProjectRights(projectId)
  }
  public async store(user: User, projectId: number) {
    return await user.hasProjectRights(projectId, Role.EDITOR)
  }
  public async update(user: User, projectId: number) {
    return await user.hasProjectRights(projectId, Role.EDITOR)
  }
  public async destroy(user: User, projectId: number) {
    return await user.hasProjectRights(projectId, Role.EDITOR)
  }
}
