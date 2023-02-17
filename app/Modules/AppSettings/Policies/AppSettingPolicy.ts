import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Modules/Users/Models/User'

export default class AppSettingPolicy extends BasePolicy {
  public async before(user: User | null) {
    if (user && user.isAdmin) {
      return true
    }
  }
  public async update() {
    return false
  }
  public async getAllAppSettings() {
    return false
  }
}
