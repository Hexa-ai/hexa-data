import NotifService from 'App/Modules/Notify/Services/NotifService'

export default class SendNotifMailToTag {
  public async handle(payload: any) {
    const notifService = new NotifService()
    await notifService.sendEmailToTag(
      payload.tag,
      payload.subject,
      payload.message,
      payload.projectId,
      payload?.attachmentId,
      payload?.attachmentName
    )
  }
}
