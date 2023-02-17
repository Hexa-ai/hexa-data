import { Queue } from '@ioc:Setten/Queue'
import puppeter from 'puppeteer'
import Project from 'App/Modules/Projects/Models/Project'
import Document from 'App/Modules/Datas/Models/Document'
import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import mime from 'mime-types'
import { cuid } from '@poppinss/utils/build/helpers'
import Env from '@ioc:Adonis/Core/Env'

export default class GenerateReport {
  public async handle(payload: any) {
    const browser = await puppeter.launch({
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--headless', '--disable-gpu'],
    })
    const project = await Project.findOrFail(payload.projectId)
    const page = await browser.newPage()
    await page.emulateMediaType('screen')
    page.setDefaultTimeout(60000)
    await page.setViewport({
      width: 1080,
      height: 1920,
      isLandscape: payload.landscape,
    })
    await page.goto(`http://127.0.0.1:${Env.get('PORT')}`)
    await page.evaluate(() => {
      localStorage.setItem('authUser', 'init')
    })
    await page.goto(
      `http://127.0.0.1:${Env.get('PORT')}/projects/${project.id}/dashboards-report/${
        project.$attributes.writeToken
      }/${payload.dashboardId}?language=${payload.language}`
    )
    await page.waitForNavigation({
      waitUntil: 'networkidle0',
    })
    const header = `<p style='margin-top: 0px; width: 100%; text-align: center; font-size: 8px; z-index: 99999;'>${
      payload.reportName.split('.')[0]
    }</p>`
    const footer = `<p style='margin-bottom: 0px; width: 100%; text-align: center; font-size: 8px; z-index: 99999;'>${payload.companyName} | ${payload.companyAdress} | ${payload.companyEmail} | ${payload.companyPhone} | ${payload.companyWebsite}</p><div class='pageNumber' style='font-size: 8px; margin-bottom: 0px;'></div><div style='font-size: 8px; margin-bottom: 0px;'>/</div><div class='totalPages' style='font-size: 8px; margin-bottom: 0px; margin-right: 5px;'></div>`
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      landscape: payload.landscape,
      headerTemplate: header,
      footerTemplate: footer,
      scale: payload.pdfScale,
      margin: {
        top: '50px',
        bottom: '50px',
      },
    })
    await page.close()
    await browser.close()
    const fileAttachment = new Attachment({
      extname: 'pdf',
      mimeType: <string>mime.lookup('pdf'),
      size: pdf.length,
      name: 'projectsDocuments/' + cuid() + '.' + 'pdf',
    })
    fileAttachment.isPersisted = true
    const document = await Document.updateOrCreate(
      { name: payload.reportName },
      {
        type: 1,
        name: payload.reportName,
        projectId: project.id,
        inProgress: true,
        file: fileAttachment,
      }
    )

    await Queue.dispatch('App/Jobs/GenerateDoc', {
      filePath: fileAttachment.name,
      fileData: pdf,
      extName: 'pdf',
      fileType: 1,
      docId: document.id,
    })
  }
}
