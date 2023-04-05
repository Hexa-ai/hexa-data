import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import Document from '../Models/Document'
import Project from '../../Projects/Models/Project'
import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import mime from 'mime-types'
import { Queue } from '@ioc:Setten/Queue'
import { cuid } from '@poppinss/utils/build/helpers'
import Drive from '@ioc:Adonis/Core/Drive'
import Logger from '@ioc:Adonis/Core/Logger'

export default class DocumentsController {
  /**
   * Show a paginated list of Documents.
   * GET projects/:projectId/documents
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async index({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.with('DocumentPolicy').authorize('index', params.projectId)
    const requestParams = request.qs()
    let documents: ModelPaginatorContract<Document>
    const fieldSort = requestParams.type == '0' ? 'name' : 'updatedAt'
    const fieldSortDirection = requestParams.type == '0' ? 'asc' : 'desc'
    if (typeof requestParams.searchKey != 'undefined' && requestParams.searchKey != '') {
      documents = await Document.query()
        .where('project_id', params.projectId)
        .andWhere('type', Number(requestParams.type))
        .andWhere('name', 'LIKE', '%' + requestParams.searchKey + '%')
        .orderBy(fieldSort, fieldSortDirection)
        .paginate(requestParams.page, requestParams.perPage)
    } else {
      documents = await Document.query()
        .where('project_id', params.projectId)
        .andWhere('type', Number(requestParams.type))
        .orderBy(fieldSort, fieldSortDirection)
        .paginate(requestParams.page, requestParams.perPage)
    }
    await Document.preComputeUrls(documents)

    response.send(documents)
  }

  /**
   * Show a paginated list of Documents (WarpScript).
   * GET Documents
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async wsReportIndex({ params, request, response }: HttpContextContract) {
    const project = await Project.query().where('writeToken', params.writeToken).firstOrFail()
    const requestParams = request.qs()
    let documents: ModelPaginatorContract<Document>
    if (typeof requestParams.searchKey != 'undefined' && requestParams.searchKey != '') {
      documents = await Document.query()
        .where('project_id', project.id)
        .andWhere('type', 1)
        .andWhere('name', 'LIKE', '%' + requestParams.searchKey + '%')
        .orderBy('updated_at')
        .paginate(requestParams.page, requestParams.perPage)
    } else {
      documents = await Document.query()
        .where('project_id', project.id)
        .andWhere('type', 1)
        .orderBy('updated_at')
        .paginate(requestParams.page, requestParams.perPage)
    }

    await Document.preComputeUrls(documents)
    response.send(documents)
  }
  /**
   * Create Repport (WarpScript).
   * POST projects/:writeToken/wsReport/store/:name
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   */
  public async wsReportStore({ params, request, response }: HttpContextContract) {
    const project = await Project.query().where('writeToken', params.writeToken).firstOrFail()

    const asplitedName = params.name.split('.')
    const extension = asplitedName[asplitedName.length - 1].toLowerCase()
    const fileAttachment = new Attachment({
      extname: extension,
      mimeType: <string>mime.lookup(extension),
      size: (<string>request.raw()).length,
      name: 'projectsDocuments/' + cuid() + '.' + extension,
    })
    fileAttachment.isPersisted = true

    // Check the existence of the previous file and delete it (avoid problems related to the queue)
    const existingDoc = await Document.query()
      .where('projectId', project.id)
      .andWhere('name', params.name)
      .first()

    if (existingDoc != null && extension == 'pdf') {
      var file: any = null
      try {
        Logger.info('-----> Writing report Project: ' + project.name + ' Rapport: ' + params.name)
        file = await Drive.get(existingDoc.file!.name!)
      } catch (e) {
        Logger.warn('-----> Writing report to too high cadence Project: ' + project.name + ' Rapport: ' + params.name)
      }
      if (file != null) {
        await (await Document.find(existingDoc.id))!.delete()

      } else {
        response.status(500)
      }
    }
    if ((existingDoc != null && extension == 'pdf') || (existingDoc == null)) {
      var document = await Document.updateOrCreate(
        { name: params.name },
        {
          type: 1,
          name: params.name,
          projectId: project.id,
          inProgress: true,
          file: fileAttachment,
        }
      )
      //await Drive.put(fileAttachment.name, '')
      await Queue.dispatch('App/Jobs/GenerateDoc', {
        filePath: fileAttachment.name,
        fileData: request.raw(),
        extName: extension,
        fileType: params.type,
        docId: document.id,
      })
    } else {
      await Queue.dispatch('App/Jobs/GenerateDoc', {
        filePath: existingDoc.file?.name,
        fileData: request.raw(),
        extName: existingDoc.file?.extname,
        fileType: params.type,
        docId: existingDoc.id,
      })
    }

    response.status(200)
  }
  /**
   * Destroy Repport (WarpScript).
   * DELETE projects/:writeToken/wsReport/:id
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   */
  public async wsReportDestroy({ params, response }: HttpContextContract) {
    const project = await Project.query().where('writeToken', params.writeToken).firstOrFail()

    await Document.query().where('project_id', project.id).andWhere('id', params.id).delete()

    response.status(200)
  }
  /**
   * Destroy Document.
   * DELETE projects/:projectId/documents/:id
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async destroy({ params, response, bouncer }: HttpContextContract) {
    await bouncer.with('DocumentPolicy').authorize('destroy', params.projectId)

    await Document.query().where('project_id', params.projectId).andWhere('id', params.id).delete()

    response.status(200)
  }
  /**
   * Create / save new documents.
   * POST projects/:projectId/documents
   *
   * @param {auth} RequestContract
   * @param {request} RequestContract
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {bouncer} BouncerContract
   */
  public async store({ request, params, response, bouncer }: HttpContextContract) {
    await bouncer.with('DocumentPolicy').authorize('store', params.projectId)
    const file = request.file('file')!

    console.log(file)

    const doc = new Document()
    doc.type = 0
    doc.projectId = params.projectId
    doc.name = <string>file.clientName
    doc.inProgress = false

    if (file !== null) {
      doc.file = Attachment.fromFile(file)
    }

    await doc.save()

    return response.created(doc)
  }
}
