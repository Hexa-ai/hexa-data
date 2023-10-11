import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SendEmailValidator from 'App/Modules/Notify/Validators/SendEmailValidator'
import SendSmsValidator from 'App/Modules/Notify/Validators/SendSmsValidator'
import SendEmailTagValidator from 'App/Modules/Notify/Validators/SendEmailTagValidator'
import SendSmsTagValidator from 'App/Modules/Notify/Validators/SendSmsTagValidator'
import { Queue } from '@ioc:Rlanz/Queue'
import Project from 'App/Modules/Projects/Models/Project'

export default class NotifyController {
  /**
   * @method wsSendEmail Send an email to a user
   * @param {HttpContextContract} { request, response, params }
   * @return {Promise<void>}
   */
  public async wsSendEmail({ request, response, params }: HttpContextContract) {
    const project = await Project.query().where('writeToken', params.writeToken).firstOrFail()
    let data = await request.validate(SendEmailValidator)
    data['projectId'] = project.id
    await Queue.dispatch('App/Jobs/SendNotifMail', data)
    response.status(200)
  }
  /**
   * @method wsSendEmailToTag Send an email to a tag
   * @param {HttpContextContract} { request, response, params }
   * @return {Promise<void>}
   */
  public async wsSendEmailToTag({ request, response, params }: HttpContextContract) {
    const project = await Project.query().where('writeToken', params.writeToken).firstOrFail()
    const data = await request.validate(SendEmailTagValidator)
    data['projectId'] = project.id
    await Queue.dispatch('App/Jobs/SendNotifMailToTag', data)
    response.status(200)
  }
  /**
   * @method wsSendSms Send an sms to a user
   * @param {HttpContextContract} { request, response, params }
   * @return {Promise<void>}
   */
  public async wsSendSms({ request, response, params }: HttpContextContract) {
    await Project.query().where('writeToken', params.writeToken).firstOrFail()
    const data = await request.validate(SendSmsValidator)
    await Queue.dispatch('App/Jobs/SendNotifSms', data)
    response.status(200)
  }
  /**
   * @method wsSendSmsToTag Send an sms to a tag
   * @param {HttpContextContract} { request, response, params }
   * @return {Promise<void>}
   */
  public async wsSendSmsToTag({ request, response, params }: HttpContextContract) {
    const project = await Project.query().where('writeToken', params.writeToken).firstOrFail()
    let data = await request.validate(SendSmsTagValidator)
    data['projectNb'] = project.id
    await Queue.dispatch('App/Jobs/SendNotifSmsToTag', data)
    response.status(200)
  }
}
