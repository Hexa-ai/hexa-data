import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Modules/Users/Models/User'
import Project from 'App/Modules/Projects/Models/Project'
import Role from '../../Projects/Contracts/enums/Roles'

export default class DevicePolicy extends BasePolicy {
  public async before(user: User | null) {
    if (user && user.isAdmin) {
      return true
    }
  }
  public async index(user: User, projectId: number) {
    return await user.hasProjectRights(projectId)
  }
  public async show(user: User, projectId: number) {
    return await user.hasProjectRights(projectId)
  }
  public async store(user: User, projectId: number) {
    if((await user.isOwner(projectId) && await user.countProjects()<user.maxProjects) || (await Project.ownerHasDevicesCredits(projectId) && await user.hasProjectRights(projectId, Role.EDITOR))){
      return true
    } else {
      return false
    }
  }
  public async update(user: User, projectId: number) {
    return await user.hasProjectRights(projectId, Role.EDITOR)
  }
  public async destroy(user: User, projectId: number) {
    return await user.hasProjectRights(projectId, Role.EDITOR)
  }
}
