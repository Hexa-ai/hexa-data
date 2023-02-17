import NotifService from 'App/Modules/Notify/Services/NotifService'
import User from 'App/Modules/Users/Models/User'

export default class SendNotifMailPassword {
  public async handle(user: User) {
    const notifService = new NotifService()
    await notifService.sendResetPasswordEmail(user)
  }
}
