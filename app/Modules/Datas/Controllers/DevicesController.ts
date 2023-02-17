import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StoreDeviceValidator from '../Validators/StoreDeviceValidator'
import UpdateDeviceValidator from '../Validators/UpdateDeviceValidator'
import AuthDeviceValidator from '../Validators/AuthDeviceValidator'
import AclDeviceValidator from '../Validators/AclDeviceValidator'
import Hash from '@ioc:Adonis/Core/Hash'
import Device from "../Models/Device"
import Project from '../../Projects/Models/Project'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import axios from 'axios'


export default class DevicesController {
  /**
   * Show a paginated list of Devices.
   * GET Devices
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async index({ params, request, response, bouncer, logger }: HttpContextContract) {
    await bouncer.with('DevicePolicy').authorize('index', params.projectId)
    const requestParams = request.qs()
    let devices: ModelPaginatorContract<Device>
    if (typeof (requestParams.searchKey) != 'undefined' && requestParams.searchKey != '') {
      devices = await Device.query().where('project_id', params.projectId).andWhere('name', 'LIKE', '%' + requestParams.searchKey + '%').orderBy('name').paginate(requestParams.page, requestParams.perPage)
    } else {
      devices = await Device.query().where('project_id', params.projectId).orderBy('name').paginate(requestParams.page, requestParams.perPage)
    }
    let result = devices.serialize()

    for (const index in result.data) {
      try {
        console.log(Env.get('MQTT_API_URL'))
        const deviceInfos = await axios.get(Env.get('MQTT_API_URL') + '/api/v4/clients/' + result.data[index].clientId, {
          auth: {
            username: Env.get('MQTT_API_USER'),
            password: Env.get('MQTT_API_PASSWORD')
          }
        })
        if (deviceInfos.data.data[0]!=undefined){
          result.data[index].ip = deviceInfos.data.data[0].ip_address
          result.data[index].connected = deviceInfos.data.data[0].connected
        } else {
          result.data[index].ip = ''
          result.data[index].connected = false
        }
      } catch (error) {
        logger.info('Boker MQTT unresponsive or clientId information unavailable')
      }

    }
    response.send(result)
  }
  /**
   * Display a single Device.
   * GET Devices/:id
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async show({ params, response, bouncer, logger }: HttpContextContract) {
    await bouncer.with('DevicePolicy').authorize('show', params.projectId)
    const device = await Device.query().where('project_id', params.projectId).andWhere('id', params.id).firstOrFail()
    let result = device.serialize()
    try {
      const deviceInfos = await axios.get(Env.get('MQTT_API_URL') + '/api/v4/clients/' + device?.clientId, {
        auth: {
          username: Env.get('MQTT_API_USER'),
          password: Env.get('MQTT_API_PASSWORD')
        }
      })
      if (deviceInfos.data.data[0]!=undefined){
        result.ip = deviceInfos.data.data[0].ip_address
        result.connected = deviceInfos.data.data[0].connected
      } else {
        result.ip = ''
        result.connected = false
      }

    } catch (error) {

      logger.info('Boker MQTT unresponsive or clientId information unavailable')
    }
    response.send(result)
  }
  /**
   * Create / save new Device.
   * POST Devices
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async store({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.with('DevicePolicy').authorize('store', params.projectId)
    const payload = await request.validate(StoreDeviceValidator)
    const device = new Device()

    device.merge(payload)
    device.projectId = params.projectId
    await device.save()

    return response.created(device)
  }
  /**
   * Update Device.
   * PATCH Devices/:id
   *
   * @param {request} RequestContract
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async update({ request, params, response, bouncer }: HttpContextContract) {
    await bouncer.with('DevicePolicy').authorize('update', params.projectId)
    const device = await Device.query().where('project_id', params.projectId).andWhere('id', params.id).firstOrFail()
    const payload = await request.validate(UpdateDeviceValidator)
    device!.merge(payload)
    device!.projectId = params.projectId
    await device!.save()

    response.send(device)
  }
  /**
   * Delete Device.
   * DELETE Devices/:id
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async destroy({ params, response, bouncer }: HttpContextContract) {
    await bouncer.with('DevicePolicy').authorize('destroy', params.projectId)
    const device = await Device.query().where('project_id', params.projectId).andWhere('id', params.id).first()
    device!.delete()

    response.send(device)
  }
  /**
   * Device Authentication.
   * POST mqtt/auth
   *
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Logger} LoggerContract
   */
  public async mqttAuth({ request, response, logger }: HttpContextContract) {
    const payload = await request.validate(AuthDeviceValidator)
    const device = await Device.query().where('clientId', payload.clientId).andWhere('username', payload.username).first()
    if (device !== null) {
      if (!(await Hash.verify(device!.password, payload.password))) {
        logger.info('MQTT Connection forbidden ->' + payload.clientId)
        response.status(400)
      } else {
        logger.info('MQTT Connection authorize ->' + payload.clientId)
        response.status(200)
      }
    } else {
      if (payload.clientId.indexOf(Env.get('MQTT_SUBSCRIBER_CLIENTID')) == 0 && payload.username == Env.get('MQTT_SUBSCRIBER_USERNAME') && payload.password == Env.get('MQTT_SBSCRIBER_PASSWORD')) {
        logger.info('MQTT Connection authorized ->' + payload.clientId)
        response.status(200)
      }
      else {
        logger.info('MQTT Connection forbidden ->' + payload.clientId)
        response.status(400)
      }
    }
  }
  /**
   * Device pub/sub ACL.
   * POST mqtt/acl
   *
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Logger} LoggerContract
   */
  public async mqttAcl({ request, response, logger }: HttpContextContract) {
    const payload = await request.validate(AclDeviceValidator)
    const device = await Device.getByClientId(payload.clientId)

    if (device !== null) {

      const rootPath: string = 'HD/' + device!.clientId + '/'
      const condPub: boolean = (payload.topic === (rootPath + 'up') && payload.access === 2)
      const condSub: boolean = (payload.topic === (rootPath + 'down') && payload.access === 1)

      if (condPub) {
        logger.info('MQTT Pub authorized ->' + payload.clientId + ' ' + payload.topic)
        response.status(200)
      } else if (condSub) {
        logger.info('MQTT Sub authorized ->' + payload.clientId + ' ' + payload.topic)
        response.status(200)
      } else {
        logger.info('MQTT Pud/Sub forbidden ->' + payload.clientId + ' ' + payload.topic)
        response.status(400)
      }

    } else if (payload.clientId.indexOf(Env.get('MQTT_SUBSCRIBER_CLIENTID')) == 0  && payload.username == Env.get('MQTT_SUBSCRIBER_USERNAME')) {
      logger.info('MQTT Sub authorized ->' + payload.clientId + ' ' + payload.topic)
      response.status(200)
    }
    else {
      logger.info('MQTT Pud/Sub forbidden ->' + payload.clientId + ' ' + payload.topic)
      response.status(400)
    }
  }
  /**
   * Device MQTT message down.
   * POST projects/:writeToken/device/:namespace/msgDown
   *
   * @param {params} Record<string, any>
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Logger} LoggerContract
   */
  public async wsMsgDown({ params, request, response, logger }: HttpContextContract){
    await Project.query().where('writeToken', params.writeToken).firstOrFail()

    const device = await Device.query().where('namespace', params.namespace).firstOrFail()

    await axios.post(Env.get('MQTT_API_URL') + '/api/v4/mqtt/publish',{
      topic:'HD/' + device.clientId + '/down',
      clientId:'hDApp',
      qos:1,
      payload:request.raw()
    }, {
      auth: {
        username: Env.get('MQTT_API_USER'),
        password: Env.get('MQTT_API_PASSWORD')
      }
    })
    logger.info('MQTT Pub ->' + 'HD/' + device.clientId + '/down')
    response.status(200)
  }
}
