import NotifService from 'App/Modules/Notify/Services/NotifService'

export default class SendNotifSmsToTag {
  public async handle(payload: any) {
    const notifService = new NotifService()
    await notifService.sendSmsToTag(payload.projectNb, payload.tag, payload.message)
  }
}
