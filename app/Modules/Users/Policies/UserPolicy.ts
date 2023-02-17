import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Modules/Users/Models/User'

export default class UserPolicy extends BasePolicy {
  public async before(user: User | null) {
    if (user && user.isAdmin) {
      return true
    }
  }
  public async index() {
    return false
  }
  public async show(user: User, userId: number) {
    return user.id==userId
  }
  public async store() {
    return false
  }
  public async update(user: User, userId: number) {
    return user.id==userId
  }
  public async destroy() {
    return false
  }

}
