import Event from '@ioc:Adonis/Core/Event'
import AppSettings from 'App/Modules/AppSettings/Models/AppSetting'
import ReportPdfValidator from '../Validators/ReportPdfValidator'
import Project from 'App/Modules/Projects/Models/Project'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ReportPdfController {
  /**
   * @method wsReportPdf Generate a new report pdf
   * @param {HttpContextContract} { request, response, params }
   * @return {Promise<void>}
   */
  public async wsReportPdf({ request, response, params }: HttpContextContract) {
    const project = await Project.query().where('writeToken', params.writeToken).firstOrFail()
    const data = await request.validate(ReportPdfValidator)
    if (data.language === undefined) data.language = 'descriptionL1'
    if (data.landscape === undefined) data.landscape = true
    if (data.pdfScale === undefined || !(data.pdfScale >= 0 && data.pdfScale <= 2)) {
      data.pdfScale = 0.3
    }
    if (
      data.companyEmail === undefined ||
      data.companyName === undefined ||
      data.companyPhone === undefined ||
      data.companyAdress === undefined ||
      data.companyWebsite === undefined
    ) {
      const settings = await AppSettings.firstOrFail()
      const appSettings = settings.serialize({
        fields: {
          omit: [],
        },
      })
      data.companyEmail = appSettings.appCompanyEmail
      data.companyName = appSettings.appCompanyName
      data.companyPhone = appSettings.appCompanyPhoneNumber
      data.companyAdress = appSettings.appCompanyAdress
      data.companyWebsite = appSettings.appCompanyWebsite
    }
    await Event.emit('send:report', { ...data, projectId: project.id })
    response.status(200)
  }
}
