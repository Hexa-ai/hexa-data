import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from '../../Projects/Models/Project'
import Warp10Service from '../../../Services/Warp10Service'
import StoreDashboardValidator from '../Validators/StoreDashboardValidator'
import UpdateDashboardValidator from '../Validators/UpdateDashboardValidator'
import Dashboard from '../Models/Dashboard'
import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import Role from 'App/Modules/Projects/Contracts/enums/Roles'

export default class DashboardsController {
  /**
   * Exec WarpScript and give it QueryString as variables.
   * POST warp10/:projectId
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async exec({ request, params, response, bouncer, auth }: HttpContextContract) {
    await bouncer.with('DashboardPolicy').authorize('exec', params.projectId)
    const requestParams = request.qs()

    const project = await Project.findOrFail(params.projectId)
    const warp10Service = new Warp10Service()

    let description: string = ''
    if (auth.user != undefined) {
      if (auth.user.lang == project.l1) {
        description = 'descriptionL1'
      } else if (auth.user.lang == project.l2) {
        description = 'descriptionL2'
      } else if (auth.user.lang == project.l3) {
        description = 'descriptionL3'
      } else {
        description = 'descriptionL1'
      }
    }
    let result = await warp10Service.exec(
      request.raw()!,
      project.readToken,
      project.writeToken,
      requestParams,
      description
    )

    response.header('x-warp10-elapsed', result.headers['x-warp10-elapsed'])
    response.header('x-warp10-ops', result.headers['x-warp10-elapsed'])
    response.header('x-warp10-fetched', result.headers['x-warp10-fetched'])
    response.header('x-warp10-error-line', result.headers['x-warp10-error-line'])
    response.header('x-warp10-error-message', result.headers['x-warp10-error-message'])

    response.send(result['data'])
  }
  /**
   * ExecReport WarpScript and give it QueryString as variables.
   * POST warp10/:projectId/:writeToken/:lang
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   */
  public async execReport({ request, params, response }: HttpContextContract) {
    const requestParams = request.qs()

    const project = await Project.findOrFail(params.projectId)
    if (project.$attributes.writeToken !== params.writeToken) {
      response.status(401).send('Unauthorized: writeToken is not valid')
      return
    }
    const warp10Service = new Warp10Service()

    let description: string = ''
    if (params.lang != undefined) {
      if (params.lang == project.l1) {
        description = 'descriptionL1'
      } else if (params.lang == project.l2) {
        description = 'descriptionL2'
      } else if (params.lang == project.l3) {
        description = 'descriptionL3'
      } else {
        description = 'descriptionL1'
      }
    }
    let result = await warp10Service.exec(
      request.raw()!,
      project.readToken,
      project.writeToken,
      requestParams,
      description
    )

    response.header('x-warp10-elapsed', result.headers['x-warp10-elapsed'])
    response.header('x-warp10-ops', result.headers['x-warp10-elapsed'])
    response.header('x-warp10-fetched', result.headers['x-warp10-fetched'])
    response.header('x-warp10-error-line', result.headers['x-warp10-error-line'])
    response.header('x-warp10-error-message', result.headers['x-warp10-error-message'])

    response.send(result['data'])
  }
  /**
   * Show a paginated list of Dashboards.
   * GET Dashboards
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async index({ auth, params, request, response, bouncer }: HttpContextContract) {
    await bouncer.with('DashboardPolicy').authorize('index', params.projectId)

    const { page, perPage, stared = '', searchKey = '' } = request.qs()

    let query = Dashboard.query().where('dashboards.project_id', params.projectId)

    if (stared !== '') {
      query = query.andWhere('stared', stared)
    }

    if (searchKey !== '') {
      query = query.andWhere('name', 'LIKE', `%${searchKey}%`)
    }

    query = query.leftJoin('project_user', (join) => {
      join.on('project_user.project_id', '=', 'dashboards.project_id')
      join.andOnVal('project_user.user_id', '=', `${auth.user!.id}`)
    })

    if (await (auth.user!.hasProjectRights(params.projectId, Role.EDITOR))==false) {
      query = query.andWhere('name', 'NOT LIKE', '\\_%').andWhere('name', 'NOT LIKE', '%.\\_%')
    }

    const dashboards = await query.orderBy('name').paginate(page, perPage)

    response.send(dashboards)
  }
  /**
   * Display a single Dashboard.
   * GET Dashboards/:id
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async show({ params, response, bouncer }: HttpContextContract) {
    await bouncer.with('DashboardPolicy').authorize('show', params.projectId)
    const dashboard = await Dashboard.query()
      .where('project_id', params.projectId)
      .andWhere('id', params.id)
      .firstOrFail()
    await Dashboard.preComputeUrls(dashboard)
    response.send(dashboard)
  }
  /**
   * Display a single Dashboard for the report.
   * GET projects/:projectId/dashboards/:readToken/:id'
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   */
  public async showReport({ params, response }: HttpContextContract) {
    const project = await Project.findOrFail(params.projectId)
    if (project.$attributes.writeToken !== params.writeToken) {
      response.status(401).send('Unauthorized: writeToken is not valid')
      return
    }
    const dashboard = await Dashboard.query()
      .where('project_id', params.projectId)
      .andWhere('id', params.id)
      .firstOrFail()
    await Dashboard.preComputeUrls(dashboard)
    response.send(dashboard)
  }
  /**
   * Create / save new Device.
   * POST Dashboards
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async store({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.with('DashboardPolicy').authorize('store', params.projectId)
    const imgBg = request.file('imgBg')!
    const payload = await request.validate(StoreDashboardValidator)
    const dashboard = new Dashboard()
    if (imgBg !== null) {
      dashboard.imgBg = Attachment.fromFile(imgBg)
    }
    dashboard.merge(payload)
    dashboard.projectId = params.projectId
    await dashboard.save()

    return response.created(dashboard)
  }
  /**
   * Update Dashboard.
   * PATCH Dashboards/:id
   *
   * @param {request} RequestContract
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async update({ request, params, response, bouncer }: HttpContextContract) {
    await bouncer.with('DashboardPolicy').authorize('update', params.projectId)
    const imgBg = request.file('imgBg')!
    const dashboard = await Dashboard.query()
      .where('project_id', params.projectId)
      .andWhere('id', params.id)
      .firstOrFail()
    const payload = await request.validate(UpdateDashboardValidator)
    if (imgBg !== null) {
      dashboard.imgBg = Attachment.fromFile(imgBg)
    }
    dashboard!.merge(payload)
    dashboard!.projectId = params.projectId
    dashboard!.save()

    response.send(dashboard)
  }
  /**
   * Delete Dashboard.
   * DELETE Dashboards/:id
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async destroy({ params, response, bouncer }: HttpContextContract) {
    await bouncer.with('DashboardPolicy').authorize('destroy', params.projectId)
    const dashboard = await Dashboard.query()
      .where('project_id', params.projectId)
      .andWhere('id', params.id)
      .first()
    dashboard!.delete()

    response.send(dashboard)
  }
}
