import NotifService from 'App/Modules/Notify/Services/NotifService'

export default class SendNotifMailAdminUserAddedProject {
  public async handle({ user, project }) {
    const notifService = new NotifService()
    await notifService.sendUserAttachedToProjectEmail(user, project)
  }
}
