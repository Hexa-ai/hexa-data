import NotifService from 'App/Modules/Notify/Services/NotifService'
import User from 'App/Modules/Users/Models/User'

export default class SendNotifMailWelcome {
  public async handle(user: User) {
    const notifService = new NotifService()
    await notifService.sendWelcomeEmail(user)
  }
}
