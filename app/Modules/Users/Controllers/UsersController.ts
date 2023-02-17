import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import StoreUserValidator from '../Validators/StoreUserValidator'
import UpdateUserValidator from '../Validators/UpdateUserValidator'
import User from '../Models/User'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { Queue } from '@ioc:Setten/Queue'

export default class UsersController {
  /**
   * Show a paginated list of users.
   * GET users
   *
   * @param {request} RequestContract
   * @param {response} ResponseContract
   */
  public async index({ request, response, bouncer }: HttpContextContract) {
    await bouncer.with('UserPolicy').authorize('index')
    const requestParams = request.qs()
    let user: ModelPaginatorContract<User>
    if (typeof requestParams.searchKey != 'undefined' && requestParams.searchKey != '') {
      user = await User.query()
        .andWhere('name', 'LIKE', '%' + requestParams.searchKey + '%')
        .orderBy('name')
        .paginate(requestParams.page, requestParams.perPage)
    } else {
      user = await User.query().orderBy('name').paginate(requestParams.page, requestParams.perPage)
    }

    response.send(user)
  }
  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   */
  public async show({ params, response, bouncer }: HttpContextContract) {
    await bouncer.with('UserPolicy').authorize('show', params.id)
    const user = await User.find(params.id)

    response.send(user)
  }
  /**
   * Create / save new user.
   * POST users
   *
   * @param {request} RequestContract
   * @param {response} ResponseContract
   */
  public async store({ auth, request, response, bouncer }: HttpContextContract) {
    await bouncer.with('UserPolicy').authorize('store')
    const photo = request.file('photo')!
    const payload = await request.validate(StoreUserValidator)

    const user = new User()
    user.name = payload.name
    user.email = payload.email
    user.lang = payload.lang
    user.password = payload.password
    user.isActivated = payload.isActivated
    user.isAdmin = payload.isAdmin
    user.number = payload.number

    if (auth.user!.isAdmin) {
      user!.maxProjects = payload.maxProjects ?? 0
      user!.maxDevices = payload.maxDevices ?? 0
      user!.maxVariables = payload.maxVariables ?? 0
      user!.maxMacros = payload.maxMacros ?? 0
    }
    if (photo !== null) {
      user.photo = Attachment.fromFile(photo)
    }

    await user.save()

    response.created(user)
  }
  /**
   * Update user.
   * PATCH users/:id
   *
   * @param {request} RequestContract
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   */
  public async update({ request, params, response, bouncer, auth }: HttpContextContract) {
    await bouncer.with('UserPolicy').authorize('update', params.id)

    const photo = request.file('photo')!

    const user = await User.find(params.id)
    const payload = await request.validate(UpdateUserValidator)
    user!.name = payload.name
    user!.email = payload.email
    user!.number = payload.number
    user!.lang = payload.lang
    user!.password = payload.password ?? user!.password

    if (auth.user!.isAdmin) {
      user!.maxProjects = payload.maxProjects ?? user!.maxProjects
      user!.maxDevices = payload.maxDevices ?? user!.maxDevices
      user!.maxVariables = payload.maxVariables ?? user!.maxVariables
      user!.maxMacros = payload.maxMacros ?? user!.maxMacros
    }
    if (payload.isActivated != undefined && auth.user?.isAdmin) {
      user!.isActivated = payload.isActivated
    }
    if (payload.isAdmin != undefined && auth.user?.isAdmin) {
      user!.isAdmin = payload.isAdmin
    }

    if (photo != null) {
      user!.photo = Attachment.fromFile(photo)
      console.log('Hello')
    }
    user!.save()

    response.send(user)
  }
  /**
   * Delete user.
   * DELETE users/:id
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   */
  public async destroy({ params, response, bouncer }: HttpContextContract) {
    await bouncer.with('UserPolicy').authorize('destroy')
    const user = await User.find(params.id)
    user!.delete()

    response.send(user)
  }
  public async forgotPassword({ request, response }: HttpContextContract) {
    const payload = await request.validate({
      schema: schema.create({
        email: schema.string([rules.email()]),
      }),
    })
    console.log(payload)
    const user = await User.findBy('email', payload.email)
    if (user === null) {
      response.status(404).send({ message: 'User not found' })
      return
    }
    await Queue.dispatch('App/Jobs/SendNotifMailPswd', user)
    response.status(200)
  }
}
