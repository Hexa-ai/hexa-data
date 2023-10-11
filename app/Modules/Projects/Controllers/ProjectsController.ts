import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import StoreProjectValidator from '../Validators/StoreProjectValidator'
import UpdateProjectValidator from '../Validators/UpdateProjectValidator'
import ImportArchiveValidator from '../Validators/ImportArchiveValidator'
import Project from '../Models/Project'
import Warp10Service from '../../../Services/Warp10Service'
import crypto from 'crypto'
import Drive from '@ioc:Adonis/Core/Drive'
import { string } from '@ioc:Adonis/Core/Helpers'
import { DateTime } from 'luxon'
import { ModelObject, ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import Device from 'App/Modules/Datas/Models/Device'
import Tag from 'App/Modules/Datas/Models/Tag'
import Role from '../Contracts/enums/Roles'
import User from 'App/Modules/Users/Models/User'
import { Queue } from '@ioc:Rlanz/Queue'
import Event from '@ioc:Adonis/Core/Event'

export default class ProjectsController {
  /**
   * Show a paginated list of projects.
   * GET projects
   *
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {auth} AuthContract
   */
  public async index({ request, response, auth }: HttpContextContract) {
    const requestParams = request.qs()
    let projects: ModelPaginatorContract<Project>
    if (typeof requestParams.searchKey != 'undefined' && requestParams.searchKey != '') {
      projects = await Project.query()
        .withScopes((scopes) => scopes.visibleTo(auth.user!))
        .andWhere('name', 'LIKE', '%' + requestParams.searchKey + '%')
        .orderBy('name')
        .select('projects.*')
        .paginate(requestParams.page, requestParams.perPage)
    } else {
      projects = await Project.query()
        .withScopes((scopes) => scopes.visibleTo(auth.user!))
        .orderBy('name')
        .select('projects.*')
        .paginate(requestParams.page, requestParams.perPage)
    }
    await Project.preComputeUrls(projects)
    const result = projects.serialize({
      fields: {
        omit: [
          'tokenUuid',
          'readToken',
          'writeToken',
          'tokenIssuance',
          'tokenExpiry',
          'ImportExportCmd',
          'ImportExportParameters',
          'exportLink',
          'exportLinkExpiry',
        ],
      },
    })
    response.send(result)
  }
  /**
   *
   * Invite user on the projectinvitation
   * POST projects/:id/invitation
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {bouncer} BouncerContract
   */
  public async invitation({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('invitation')

    const searchedUser = await User.query().where('email', request.input('email')).first()

    const project = await Project.find(params.id)
    if (searchedUser == null) {
      response.notFound()
    } else {
      if (searchedUser?.isActivated == false) {
        searchedUser.isActivated = true
        await searchedUser.save()
      }
      await project?.related('users').attach([searchedUser.id])
      Event.emit('new:invitation', { user: searchedUser, project })

      response.created()
    }
  }
  /**
   * Display a single project.
   * GET projects/:id
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {bouncer} ActionsAuthorizerContract<User>
   * @param {auth} AuthContract
   */
  public async show({ params, response, bouncer, auth }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('show', params.id)
    const project = await Project.query()
      .where('projects.id', params.id)
      .preload('users')
      .preload('owner')
      .firstOrFail()
    const devicesCount = (await Device.query().where('projectId', params.id)).length
    const tagCount = (await Tag.query().where('projectId', params.id).where('type', 1)).length
    const textCount = (await Tag.query().where('projectId', params.id).where('type', 2)).length
    const macroCount = (await Tag.query().where('projectId', params.id).where('type', 3)).length

    const filePath = 'export/' + string.camelCase(project.name) + '.json'

    if (project.ImportExportCmd == 1) {
      project.exportLink = await Drive.getSignedUrl(filePath, {
        expiresIn: '2mins',
      })
      project.exportLinkExpiry = DateTime.now().plus({ minutes: 2 })
      project.ImportExportCmd = 0
      await project!.save()
    } else if (
      project.exportLinkExpiry < DateTime.now() &&
      project.ImportExportCmd == 0 &&
      project!.exportLink != ''
    ) {
      Drive.delete(filePath)
      project!.exportLink = ''
      await project!.save()
    }

    let result: ModelObject

    await auth.user!.load('projects')

    if (
      (await auth.user?.hasProjectRights(params.id, Role.EDITOR)) === true ||
      auth.user?.isAdmin === true
    ) {
      result = project.serialize()
    } else {
      result = project.serialize({
        fields: {
          omit: [
            'tokenUuid',
            'readToken',
            'writeToken',
            'tokenIssuance',
            'tokenExpiry',
            'ImportExportCmd',
            'ImportExportParameters',
            'exportLink',
            'exportLinkExpiry',
          ],
        },
      })
    }

    result.devicesCount = devicesCount
    result.tagCount = tagCount
    result.textCount = textCount
    result.macroCount = macroCount

    response.send(result)
  }
  /**
   * Create / save new project.
   * POST projects
   *
   * @param {auth} RequestContract
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {bouncer} BouncerContract
   */
  public async store({ auth, request, response, bouncer }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('store')
    const photo = request.file('photo')!
    const payload = await request.validate(StoreProjectValidator)
    const project = new Project()
    project.ownerId = auth.user!.id
    project.name = payload.name
    project.description = payload.description
    project.lat = payload.lat
    project.long = payload.long
    project.adress = payload.adress
    project.l1 = payload.l1
    project.l2 = payload.l2
    project.l3 = payload.l3
    await project.save()

    project.uuid = crypto.randomUUID()

    const warp10Service = new Warp10Service()
    const tokens = await warp10Service.generatePairOfTokens(
      { projectUuid: project.uuid },
      project.uuid
    )

    project.readToken = tokens.readToken
    project.writeToken = tokens.writeToken
    project.tokenIssuance = tokens.issuance
    project.tokenExpiry = tokens.expiry

    if (photo !== null) {
      project.photo = Attachment.fromFile(photo)
    }

    project.merge(await project.save())
    project.related('users').create(auth.user!)

    return response.created(project)
  }
  /**
   * Update project.
   * PATCH projects/:id
   *
   * @param {request} RequestContract
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {bouncer} BouncerContract
   */
  public async update({ request, params, response, bouncer }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('update', params.id)
    const photo = request.file('photo')!

    const project = await Project.findOrFail(params.id)
    const payload = await request.validate(UpdateProjectValidator)

    project!.name = payload.name
    project!.description = payload.description
    project!.lat = payload.lat
    project!.long = payload.long
    project!.adress = payload.adress
    project!.l1 = payload.l1
    project!.l2 = payload.l2
    project!.l3 = payload.l3
    if (photo !== null) {
      project!.photo = Attachment.fromFile(photo)
    }
    project!.save()

    response.send(project)
  }
  /**
   * Delete project.
   * DELETE projects/:id
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {bouncer} BouncerContract
   */
  public async destroy({ params, response, bouncer }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('destroy')
    const project = await Project.find(params.id)
    await project?.related('users').detach()
    project?.delete()

    response.send(project)
  }
  /**
   * remove user from project.
   * DELETE projects/:projectId/users
   *
   * @param {request} RequestContract
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {bouncer} BouncerContract
   */
  public async removeUsers({ params, response, bouncer }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('removeUsers')
    const project = await Project.find(params.id)
    await project?.related('users').detach([params.userId])

    response.ok
  }
  /**
   * Update user role and tags on project.
   * PATCH projects/:projectId/users/:userId
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {bouncer} BouncerContract
   */
  public async updateUserSettings({ params, request, bouncer }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('updateUserSettings')

    const project = await Project.findOrFail(params.id)

    const user = await project
      .related('users')
      .query()
      .where('user_id', params.userId)
      .firstOrFail()

    await user
      .related('projects')
      .save(project, true, { role: Number(request.input('role')), tags: request.input('tags') })
  }
  /**
   * Import project from archive.
   * POST projects/import/:id
   *
   * @param {request} RequestContract
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   */
  public async import({ request, params, response, bouncer }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('import', params.id)
    const archive = request.file('archive')!
    await request.validate(ImportArchiveValidator)
    let project = await Project.findOrFail(params.id)

    if (project.ImportExportCmd == 0 || project.ImportExportCmd == null) {
      if (archive !== null) {
        archive.moveToDisk('import/', { name: string.camelCase(project.name) + '.json' })
        project.ImportExportCmd = 10
        await project.save()
        Queue.dispatch('App/Jobs/ImportProjectConf', project.id)
      } else {
        //406 Not Acceptable
        response.status(406)
      }
      response.send(project)
    } else {
      //409 Conflict
      response.status(409)
    }
    response.send(project)
  }
  /**
   * Export project to archive.
   * GET projects/export/:id/:from/:to
   *
   * @param {request} RequestContract
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   */
  public async export({ params, response, bouncer }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('export', params.id)
    const project = await Project.findOrFail(params.id)
    if (project.ImportExportCmd == 0 || project.ImportExportCmd == null) {
      await Queue.dispatch('App/Jobs/ExportProjectConf', project.id)
      response.send(project)
    } else {
      response.status(409)
    }
  }
}
