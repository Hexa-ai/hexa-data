import { OvhAPiConfig } from 'Config/ovh'
import Mail from '@ioc:Adonis/Addons/Mail'
import Drive from '@ioc:Adonis/Core/Drive'
import ovh from 'ovh'
import User from 'App/Modules/Users/Models/User'
import Project from 'App/Modules/Projects/Models/Project'
import AppSettings from 'App/Modules/AppSettings/Models/AppSetting'
import View from '@ioc:Adonis/Core/View'
import mjml from 'mjml'
import crypto from 'node:crypto'
import Env from '@ioc:Adonis/Core/Env'
import Document from 'App/Modules/Datas/Models/Document'
import Logger from '@ioc:Adonis/Core/Logger'

/**
 * @class NotifService
 * This class can be used to send notifications to the user by email or SMS
 */
export default class NotifService {
  protected api: any
  protected serviceName: string

  constructor() {
    const config = OvhAPiConfig
    this.api = ovh(config)
    this.getService()
  }

  private async getService() {
    await this.api
      .requestPromised('GET', '/sms')
      .then((result: string) => {
        this.serviceName = result
      })
      .catch((error: any) => {
        Logger.warn(error)
      })
  }

  /**
   * @method sendSms This method is used to send a SMS to the user
   * @param receivers {string[]} The list of receivers
   * @param message {string} The message to send
   * @returns error {any} The error if there is one
   */
  public async sendSms(receivers: string[], message: string) {
    if (!this.serviceName) {
      await this.getService()
    }

    for (let i = 0; i < receivers.length; i++) {
      if (!receivers[i].startsWith('0033') && receivers[i].startsWith('07') || receivers[i].startsWith('06')) {
        receivers[i] = '0033' + receivers[i].substring(1)
      }
    }

    const status = await this.api.requestPromised('POST', `/sms/${this.serviceName}/jobs`, {
      message: message,
      senderForResponse: true,
      receivers: receivers,
    })
    console.log(status)
    return { message: status }
  }

  /**
   * @method sendEmail This method is used to send an email to the user
   * @param receivers {string[]} The list of receivers
   * @param subject {string} The subject of the email
   * @param message {string} The message to send
   * @param attachmentId {number} The attachmentId to send
   * @param attachmentName {string} The name of the attachment with the extension (ex: test.png)
   * @returns error {any} The error if there is one
   */
  public async sendEmail(receivers: string[], subject: string, message: string, projectId:number, attachmentId: number, attachmentName: string) {
    try {
      let file: Buffer
      if (attachmentId !== undefined && attachmentName !== '') {
        var document = await Document.query().where('id', attachmentId).andWhere('projectId', projectId).firstOrFail()
        file = await Drive.get(document.file!.name)
      }
      for (let i = 0; i < receivers.length; i++) {
        await Mail.send((msg) => {
            if (attachmentId !== undefined && attachmentName !== '')
              msg.attachData(file, {
                filename: attachmentName,
              })
            msg
            .from(Env.get('EMAIL_FROM'))
            .to(receivers[i])
            .subject(subject)
            .text(message)
        })
      }
    } catch (error) {
      Logger.warn(error)
      return error
    }
    return { message: 'Email sent' }
  }
  /**
   * @method sendWelcomeEmail This method is used to send a welcome email to new user
   * @param usser {User} The new user to send the email
   * @returns void
   */
  public async sendWelcomeEmail(user: User) {
    const settings = await AppSettings.query().select('appTitle', 'appSubTitle1', 'appCompanyName', 'appCompanyAdress', 'appCompanyEmail', 'appCompanyPhoneNumber').firstOrFail()
    const appSettings = settings.$attributes
    const htmlRender = mjml(await View.render('emails/welcome', { appTitle: appSettings.appTitle, appSubtitle: appSettings.appSubTitle1, name: user.name, companyName: appSettings.appCompanyName, companyAddress: appSettings.appCompanyAdress, companyEmail: appSettings.appCompanyEmail, companyNumber: appSettings.appCompanyPhoneNumber })).html
    await Mail.sendLater((msg) => {
      msg
        .from(Env.get('EMAIL_FROM'))
        .to(user.email)
        .subject(`Bienvenue dans ${appSettings.appTitle}!`)
        .html(htmlRender)
    })
  }
  /**
   * @method sendAdminEmail This method is used to send an information email to the admin about a new user
   * @param usser {User} The new user who has been created
   * @returns void
   */
  public async sendAdminEmail(user: User) {
    const settings = await AppSettings.query().select('appTitle', 'appSubTitle1', 'appCompanyName', 'appCompanyAdress', 'appCompanyEmail', 'appCompanyPhoneNumber').firstOrFail()
    const appSettings = settings.$attributes
    const admins = await User.query().select('name', 'email').where('isAdmin', true)
    admins.forEach(async (admin) => {
      const htmlRender = mjml(await View.render('emails/admin-new-user', { appTitle: appSettings.appTitle, appSubtitle: appSettings.appSubTitle1, email: user.email, name: user.name, companyName: appSettings.appCompanyName, companyAddress: appSettings.appCompanyAdress, companyEmail: appSettings.appCompanyEmail, companyNumber: appSettings.appCompanyPhoneNumber })).html
      await Mail.sendLater((msg) => {
        msg
        .from(Env.get('EMAIL_FROM'))
        .to(admin?.email)
        .subject('Un nouvelle utilisateur s\'est inscrit')
        .html(htmlRender)
      })
    });

  }
  /**
   * @method sendResetPasswordEmail This method is used to send new password to the user
   * @param user {User} The new user who needs to reset his password
   * @returns void
   */
  public async sendResetPasswordEmail(user: User) {
    const settings = await AppSettings.query().select('appTitle', 'appSubTitle1', 'appCompanyName', 'appCompanyAdress', 'appCompanyEmail', 'appCompanyPhoneNumber').firstOrFail()
    const appSettings = settings.$attributes
    const token = crypto.randomBytes(12).toString('hex')
    User.updateOrCreate({ id: user.id }, { password: token })
    const htmlRender = mjml(await View.render('emails/user-new-password', { appTitle: appSettings.appTitle, appSubtitle: appSettings.appSubTitle1, name: user.email, password: token, companyName: appSettings.appCompanyName, companyAddress: appSettings.appCompanyAdress, companyEmail: appSettings.appCompanyEmail, companyNumber: appSettings.appCompanyPhoneNumber })).html
    await Mail.sendLater((msg) => {
      msg
      .from(Env.get('EMAIL_FROM'))
      .to(user.email)
      .subject('Votre nouveau mot de passe')
      .html(htmlRender)
    })
  }
  /**
   * @method sendUserAttachedToProjectEmail This method is used to inform the user that he has been attached to a project
   * @param usser {User} The new user who needs to be informed
   * @returns void
   */
  public async sendUserAttachedToProjectEmail(user: User, project: Project) {
    const settings = await AppSettings.query().select('appTitle', 'appSubTitle1', 'appCompanyName', 'appCompanyAdress', 'appCompanyEmail', 'appCompanyPhoneNumber').firstOrFail()
    const appSettings = settings.$attributes
    const htmlRender = mjml(await View.render('emails/user-new-project', { appTitle: appSettings.appTitle, appSubtitle: appSettings.appSubTitle1, name: user.email, projectName: project.name, companyName: appSettings.appCompanyName, companyAddress: appSettings.appCompanyAdress, companyEmail: appSettings.appCompanyEmail, companyNumber: appSettings.appCompanyPhoneNumber })).html
    await Mail.sendLater((msg) => {
      msg
      .from(Env.get('EMAIL_FROM'))
      .to(user.email)
      .subject('Vous venez d\'être invité sur un projet')
      .html(htmlRender)
    })
  }
  /**
   * @method sendEmailToTag This method is used to send an email to a tagged user
   * @param tag {string} The users tag to send the email to
   * @param subject {string} The email subject
   * @param message {string} The email message
   * @param projectId {number} The project id
   * @param attachmentId {number} The attachment id
   * @param attachmentName {string} The attachment name
   * @returns void
   */
  public async sendEmailToTag( tag: string, subject: string, message: string, projectId: number, attachmentId?: number, attachmentName?: string) {
    const project = await Project.find(projectId)
    const users = await project?.related('users').query().select('email').wherePivot('tags', 'like', '%' + tag + '%')

    const receivers = users!.map((user) => user.email)
    try {
      let file: Buffer
      if (attachmentId !== undefined && attachmentName !== '') {
        var document = await Document.query().where('id', attachmentId).andWhere('projectId', projectId).firstOrFail()
        file = await Drive.get(document.file!.name)
      }

      for (let i = 0; i < receivers.length; i++) {
        await Mail.send((msg) => {
            if (attachmentId !== undefined && attachmentName !== '')
              msg.attachData(file, {
                filename: attachmentName,
              })
            msg
            .from(Env.get('EMAIL_FROM'))
            .to(receivers[i])
            .subject(subject)
            .text(message)
        })
      }
    } catch (error) {
      Logger.warn(error)
      return error
    }
  }
  /**
   * @method sendSmsToTag This method is used to send an sms to a tagged user
   * @param projectId {number} The project id
   * @param tag {string} The users tag to send the email to
   * @param message {string} The sms message
   * @returns void
   */
  public async sendSmsToTag(projectId: number, tag: string, message: string) {
    const project = await Project.find(projectId)
    const users = await project?.related('users').query().select('number').wherePivot('tags', 'like', '%' + tag + '%').andWhere('number', '!=', '')
    const receivers = users?.map((user) => user.number)

    if (receivers !== undefined) {
      for (let i = 0; i < receivers?.length; i++) {
        if (
          (!receivers[i]?.startsWith('0033') && receivers[i]?.startsWith('07')) ||
          receivers[i]?.startsWith('06')
        ) {
          receivers[i] = '0033' + receivers[i]?.substring(1)
        }
      }
      const safeReceivers = receivers === undefined ? [] : (receivers as string[])
      const status = await this.sendSms(safeReceivers, message)
      return status
    }
    return { message: 'No receivers found' }
  }
}
