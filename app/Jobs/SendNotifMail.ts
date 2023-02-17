import NotifService from 'App/Modules/Notify/Services/NotifService'

export default class SendNotifMail {
  public async handle(payload: any) {
    const notifService = new NotifService()
    await notifService.sendEmail(
      payload.receivers,
      payload.subject,
      payload.message,
      payload.projectId,
      payload?.attachmentId,
      payload?.attachmentName,

    )
  }
}
