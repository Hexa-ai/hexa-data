import NotifService from 'App/Modules/Notify/Services/NotifService'

export default class SendNotifSms {
  public async handle(payload: any) {
    const notifService = new NotifService()
    await notifService.sendSms(payload.receivers, payload.message)
  }
}
