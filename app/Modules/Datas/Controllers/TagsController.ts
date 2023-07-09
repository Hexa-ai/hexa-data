import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StoreTagValidator from '../Validators/StoreTagValidator'
import UpdateTagValidator from '../Validators/UpdateTagValidator'
import CsvService from '../Services/CsvService'
import Project from '../../Projects/Models/Project'
import Tag from '../Models/Tag'
import TagsService from '../Services/TagsService'
import { Queue } from '@ioc:Setten/Queue'

export default class TagsController {
  /**
   * Show a paginated list of Tags.
   * GET Tags
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async index({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.with('TagPolicy').authorize('index', params.projectId)
    const requestParams = request.qs()
    const query = Tag.query()
      .where('project_id', params.projectId)
      .preload('device', (query) => {
        query.orderBy('devices.namespace', 'asc')
        query.orWhere
      })
      .orderBy('name', 'asc')

    if (requestParams.typeFilter) {
      query.andWhere('type', requestParams.typeFilter)
    }

    if (requestParams.searchKey) {
      query.andWhere((query) => {
        query
          .where('name', 'like', `%${requestParams.searchKey}%`)
          .orWhereHas('device', (query) => {
            query.where('namespace', 'like', `%${requestParams.searchKey}%`)
          })
      })
    }

    let tags: Tag[] = await query.paginate(requestParams.page, 10000)

    response.send(tags)
  }
  /**
   * Display a single Tag.
   * GET Tag/:id
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async show({ params, response, bouncer }: HttpContextContract) {
    await bouncer.with('TagPolicy').authorize('show', params.projectId)
    const tags = await Tag.query()
      .where('project_id', params.projectId)
      .preload('device')
      .andWhere('id', params.id)
      .first()
    response.send(tags)
  }
  /**
   * Create / save new Tag.
   * POST Tags
   *
   * @param {request} RequestContract
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async store({ request, response, params, bouncer }: HttpContextContract) {
    const payload = await request.validate(StoreTagValidator)
    await bouncer.with('TagPolicy').authorize('store', params.projectId, payload.type)
    const tag = new Tag()
    tag.merge(payload)
    await tag.save()
    if (tag.type == 2 || tag.type == 1) {
      const project = await Project.find(+params.projectId)
      const tagService = new TagsService(project!)
      await tagService.createGts([tag])
    }

    return response.created(tag)
  }
  /**
   * Update Tag.
   * PATCH Tags/:id
   *
   * @param {request} RequestContract
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async update({ request, params, response, bouncer }: HttpContextContract) {
    await bouncer.with('TagPolicy').authorize('update', params.projectId)
    const tag = await Tag.query()
      .where('project_id', params.projectId)
      .andWhere('id', params.id)
      .firstOrFail()
    const oldTagName = tag.name
    const payload = await request.validate(UpdateTagValidator)
    if (oldTagName!=payload.name && tag.type==3) {
      console.log('refactor')
      await Queue.dispatch('App/Jobs/RefactorWs', {
        oldTagName: oldTagName,
        tagName: payload.name,
        projectId: params.projectId
      })
      console.log('old macro name:' + oldTagName)
      console.log('macro name:' + payload.name)
      console.log('project Id:' + params.projectId)
    }
    tag!.merge(payload)
    // Keep the same name if not macro
    if (tag.type == 2 || tag.type == 1) {
      tag.name = oldTagName
    }
    tag.projectId = params.projectId
    await tag.save()
    if (tag.type == 2 || tag.type == 1) {
      const project = await Project.findOrFail(+params.projectId)
      const tagService = new TagsService(project)
      await tagService.createGts([tag])
    }

    response.send(tag)
  }
  /**
   * Delete Tag.
   * DELETE Tags/:id
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async destroy({ params, response, bouncer }: HttpContextContract) {
    await bouncer.with('TagPolicy').authorize('destroy', params.projectId)
    const tag = await Tag.query()
      .where('project_id', params.projectId)
      .andWhere('id', params.id)
      .preload('device')
      .firstOrFail()

    if (tag.type == 2 || tag.type == 1) {
      const project = await Project.find(+params.projectId)
      const tagService = new TagsService(project!)
      await tagService.deleteGts([tag!])
    }

    await tag!.delete()

    response.send(tag)
  }
  /**
   * Export Tags in CSV.
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async exportInCsv({ params, response, bouncer }: HttpContextContract) {
    await bouncer.with('TagPolicy').authorize('exportInCsv', params.projectId)
    const tagList = await Tag.query()
      .select([
        'id',
        'name',
        'description_l1',
        'description_l2',
        'description_l3',
        'unit',
        'type',
        'value_type',
        'device_id',
        'physicalUnit',
        'settings',
        'alarm',
        'triggerType',
        'minTreshold',
        'maxTreshold'
      ])
      .where('project_id', +params.projectId)
      // export only variables
      .where('type', 1)

    response.send(CsvService.toCsv(tagList))
  }
  /**
   * Validate and import Tags from CSV (Store or update).
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async importFromCsv({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.with('TagPolicy').authorize('importFromCsv', params.projectId)
    const project = await Project.find(+params.projectId)
    const tagService = new TagsService(project!)

    const payload = await tagService.importFromCsv(request.file('csvFile')!, bouncer)
    const tags: Tag[] = <Tag[]>payload.datas

    if (payload.errorsNumber == 0) {
      let createdTags = await Tag.updateOrCreateMany('name', tags)

      for (const index in createdTags) {
        await createdTags[index].load('device')
      }

      await tagService.createGts(createdTags)
    }
    return response.send(payload)
  }
}
