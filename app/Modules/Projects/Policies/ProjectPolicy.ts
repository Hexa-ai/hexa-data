import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Modules/Users/Models/User'
import Role from '../Contracts/enums/Roles'

export default class ProjectPolicy extends BasePolicy {
  public async before(user: User | null) {
    if (user && user.isAdmin) {
      return true
    }
  }
  public async show(user: User, projectId: number) {
    return await user.hasProjectRights(projectId)
  }
  public async store(user: User) {
    if ((await user.countProjects()) < user.maxProjects) {
      return true
    } else {
      return false
    }
  }
  public async update(user: User, projectId: number) {
    return await user.hasProjectRights(projectId, Role.EDITOR)
  }
  public async destroy() {
    return false
  }
  public async import(user: User, projectId: number) {
    return await user.hasProjectRights(projectId, Role.EDITOR)
  }
  public async export(user: User, projectId: number) {
    return await user.hasProjectRights(projectId, Role.EDITOR)
  }
  public async invitation() {
    return false
  }
  public async updateUserSettings() {
    return false
  }
  public async removeUsers() {
    return false
  }
  public async generatePersistentTokens() {
    return false
  }
  public async updateDashboardType() {
    return false
  }
  public async getGrafanaCookies(user: User, projectId: number) {
    return await user.hasProjectRights(projectId)
  }
}
