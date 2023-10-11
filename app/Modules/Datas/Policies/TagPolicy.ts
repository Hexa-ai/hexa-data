import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import Project from 'App/Modules/Projects/Models/Project'
import User from 'App/Modules/Users/Models/User'
import Role from '../../Projects/Contracts/enums/Roles'

export default class TagPolicy extends BasePolicy {
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
  public async store(user: User, projectId: number, tagType:number) {
    if(tagType==1 && (await user.isOwner(projectId) && await user.countVariables()<user.maxVariables) || (await Project.ownerHasVariablesCredits(projectId) && await user.hasProjectRights(projectId, Role.EDITOR))) {
      return true
    } if(tagType==3 && (await user.isOwner(projectId) && await user.countMacros()<user.maxMacros) || (await Project.ownerHasMacrosCredits(projectId) && await user.hasProjectRights(projectId, Role.EDITOR))) {
      return true
    } if(tagType==4 && (await user.isOwner(projectId) && await user.countMacros()<user.maxMacros) || (await Project.ownerHasMacrosCredits(projectId) && await user.hasProjectRights(projectId, Role.EDITOR))) {
      return true
    }if(tagType==2 && await user.hasProjectRights(projectId, Role.EDITOR)){
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
  public async importFromCsv(user: User, projectId: number) {
    return await user.hasProjectRights(projectId, Role.EDITOR)
  }
  public async exportInCsv(user: User, projectId: number) {
    return await user.hasProjectRights(projectId, Role.EDITOR)
  }
  // public async validateFromCsv(user: User, projectId: number) {
  //   return await user.hasProjectRights(projectId, Role.EDITOR)
  // }
}
