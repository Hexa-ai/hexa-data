import Env from '@ioc:Adonis/Core/Env'
import mqtt from 'mqtt'
import Tag from 'App/Modules/Datas/Models/Tag'
import Project from 'App/Modules/Projects/Models/Project'
import { HdmIngressService } from './HdmIngressService'
import { lightTag } from './../Contracts/tags'
import { WarpGts } from 'App/Services/Warp10Service'
import Warp10Service from 'App/Services/Warp10Service'
import Logger from '@ioc:Adonis/Core/Logger'
import crypto from 'crypto'
import Redis from '@ioc:Adonis/Addons/Redis'
import { MqttMessage } from '../Contracts/MqttMessage'
import dispatchRouting from '../mqtt_routes'

interface Script {
  id: number
  type: number
  name: string
  projectId: number
  script: string
  readToken: string
  writeToken: string
}

export default class MqttSbuscriberService {
  constructor() {
    // Load Env variables
    this.mqttEndpoint = Env.get('MQTT_ENDPOINT')
    this.clientId = Env.get('MQTT_SUBSCRIBER_CLIENTID') + '_' + crypto.randomUUID()
    this.username = Env.get('MQTT_SUBSCRIBER_USERNAME')
    this.password = Env.get('MQTT_SBSCRIBER_PASSWORD')

    this.warp10Service = new Warp10Service()

    this.statInterval = 60000 + Math.round(Math.random() * 1000)

    // Init Authorized tags list and projects tokens list
    this.initTags()

    // Cyclical update of tags list and projects tokens list
    setInterval(() => {
      this.tagObserver()
      this.hdmp.authorizedTags = this.authorizedTags
      this.hdmp.gtsProjectIdMapping = this.gtsProjectIdMapping
      this.projectTokenObserver()
      this.hdmp.projectTokenCollection = this.projectTokenCollection
    }, 10000)
    // Cyclical metrics update
    setInterval(() => {
      this.storeMsgMetrics()
    }, this.statInterval)

    // Delays the MQTT connexion
    setTimeout(() => {
      const client = mqtt.connect(this.mqttEndpoint, {
        clientId: this.clientId,
        username: this.username,
        password: this.password,
      })

      client.on('connect', function () {
        console.log('---- MQTT Subscriber Connected ----')
        client.subscribe(['$share/g1/HD/+/up', '$share/g1/HD/+/#'], function () {})
      })

      // New message routing and handling
      client.on('message', (topic, message) => this.routeMessage(topic, message))

      // Legacy message handling
      client.on('message', (topic, message) => this.messageReceived(topic, message))
    }, 5000)
  }

  public warp10Service: Warp10Service

  // Env vars
  public mqttEndpoint: string
  public clientId: string
  public username: string
  public password: string

  // device stat calc interval in millisecond
  readonly statInterval: number
  // kev value list of device rate stat
  public deviceMsgStat: { [index: string]: { msgCounter: number } } = {}

  // Hexa-data metrics protocol decoder instance
  public hdmp: HdmIngressService

  // Project Warp10 Token list
  public projectTokenCollection: string[]

  // Project Uuid / ProjectId mapping
  public gtsProjectUuidMapping: { [index: string]: number }

  // GTS / ProjetId mapping
  public gtsProjectIdMapping: { [index: string]: number }

  // Authorized tags from hexa-data
  public authorizedTags: { [index: string]: lightTag }[]

  // Authorized device-projectId
  public authorizesDevicesProjectId: { [index: string]: number }

  // Authorized device-namespace
  public authorizesDevicesNamespace: { [index: string]: string }
  //
  protected scriptCollection: { [key: string]: Script }
  /*
   * Initializes Authorized tags list and project tokens list
   */
  public async initTags() {
    await this.tagObserver()
    await this.projectTokenObserver()
    this.hdmp = new HdmIngressService(
      this.authorizedTags,
      this.projectTokenCollection,
      this.gtsProjectIdMapping
    )
  }

  /*
   * Load Authorized tags list in authorizedTags attribute
   *
   */
  public async tagObserver() {
    await this.getScriptCollection()
    let gtsProjectIdMapping: { [index: string]: number } = {}
    let gtsProjectUuidMapping: { [index: string]: number } = {}
    let authorizedTags: { [index: string]: lightTag }[] = []
    let authorizesDevicesProjectId: { [index: string]: number } = {}
    let authorizesDevicesNamespace: { [index: string]: string } = {}
    const tags = await Tag.query()
      .preload('device')
      .preload('project', (projectQuery) => {
        projectQuery.select(['writeToken', 'uuid'])
      })
      .select(['name', 'projectId', 'deviceId', 'type', 'valueType', 'physicalUnit'])
      .where('type', 1)
    tags.map(function (tag) {
      const authorizedTag: lightTag = {
        name: tag.name,
        projectId: tag.projectId,
        projectUuid: tag.project.uuid,
        deviceId: tag.deviceId,
        type: tag.type,
        valueType: tag.valueType,
        clientId: tag.device.clientId,
        namespace: tag.device.namespace,
        writeToken: tag.project.writeToken,
        physicalUnit: tag.physicalUnit,
      }
      if (!authorizedTags[tag.device.clientId]) {
        authorizedTags[tag.device.clientId] = []
      }
      gtsProjectIdMapping[authorizedTag.namespace + '.' + authorizedTag.name] =
        authorizedTag.projectId
      authorizedTags[tag.device.clientId][authorizedTag.name] = authorizedTag
      authorizesDevicesProjectId[tag.device.clientId] = authorizedTag.projectId
      authorizesDevicesNamespace[tag.device.clientId] = authorizedTag.namespace
    })
    const macros = await Tag.query()
      .preload('device')
      .preload('project', (projectQuery) => {
        projectQuery.select(['writeToken', 'uuid'])
      })
      .select(['name', 'projectId', 'deviceId', 'type', 'valueType'])
      .where('type', 3)
    macros.map(function (macros) {
      gtsProjectUuidMapping[macros.project.uuid] = macros.projectId
    })
    this.authorizedTags = authorizedTags
    this.authorizesDevicesProjectId = authorizesDevicesProjectId
    this.authorizesDevicesNamespace = authorizesDevicesNamespace
    this.gtsProjectIdMapping = gtsProjectIdMapping
    this.gtsProjectUuidMapping = gtsProjectUuidMapping
    Logger.info('Tags list updated')
  }
  /*
   * Load projects tokens list in projectTokenCollection attribute
   *
   */
  public async projectTokenObserver() {
    const projectTokenCollection: string[] = []
    const projects = await Project.query().select(['id', 'writeToken'])
    projects.map(function (project) {
      projectTokenCollection[project.id] = project.writeToken
    })

    this.projectTokenCollection = projectTokenCollection
  }

  /*
   * Handle new mqtt message routing
   * Accepted format is : HD/<projectUuid>/<action>/<...params>
   */
  public async routeMessage(topic: string, message: Buffer) {
    try {
      // Parse the mqtt topic/message into a MqttMessage object
      const [prefix = 'HD', projectUuid = null, action = null, ...params] = topic.split('/')

      // Verify if the project Uuid exists
      let projectId: number
      if (projectUuid !== null && projectUuid in this.gtsProjectUuidMapping) {
        projectId = this.gtsProjectUuidMapping[projectUuid]
      } else {
        throw new Error('the projectUuid parameter is missing in the topic')
      }

      // Increment project counter
      this.incrementDeviceMsgCounter(projectUuid)

      // Verify if any action is specified
      if (action === null) {
        throw new Error('the action parameter is missing in the topic')
      }

      // Parse the payload as object
      const payload: any = JSON.parse(message.toString())

      // Build up the MqttMessage, and dispatch it to the routes
      const mqttMessage: MqttMessage = { prefix, projectUuid, projectId, action, params, payload }
      await dispatchRouting({ mqttMessage })
    } catch (e) {
      Logger.warn('Could not route mqtt message ' + topic + ':' + e.message)
    }
  }

  /*
   * Process the new incoming messages
   */
  public async messageReceived(topic: string, message: Buffer) {
    let payload: any = message.toString()
    try {
      const splitedTopic = topic.split('/')
      if (this.gtsProjectUuidMapping[splitedTopic[1]] != undefined) {
        const macroName =
          'mqtt.' + topic.split(splitedTopic[0] + '/' + splitedTopic[1] + '/')[1].replace('/', '.')
        if (this.scriptCollection[macroName] != undefined) {
          if (this.scriptCollection[macroName].type == 3) {
            this.scriptCollection[macroName].script = Warp10Service.wsAppendVar(
              this.scriptCollection[macroName].script,
              'payload',
              payload
            )
            this.warp10Service.scriptExec(
              this.scriptCollection[macroName].script,
              this.scriptCollection[macroName].readToken,
              this.scriptCollection[macroName].writeToken,
              this.scriptCollection[macroName].projectId
            )
            return
          } else if (this.scriptCollection[macroName].type == 4) {
            const message = {
              projectId: this.scriptCollection[macroName].projectId,
              readToken: this.scriptCollection[macroName].readToken,
              writeToken: this.scriptCollection[macroName].writeToken,
              macroName: macroName,
              macroId: this.scriptCollection[macroName].id,
              script: this.scriptCollection[macroName].script,
              payload: payload,
            }
            Redis.publish('mqttHook:' + macroName, JSON.stringify(message))
            return
          }
        }
      } else {
        payload = JSON.parse(payload)
        if (payload.protocol == 'hdmp') {
          const clientId = splitedTopic[1]
          this.incrementDeviceMsgCounter(clientId)
          this.hdmp.processPayload(payload, clientId)
        }
      }
    } catch (e) {
      Logger.error('Payload MQTT Error')
      Logger.error(e)
    }
  }
  /**
   * Retreive script collection from DB tags tab
   */
  protected async getScriptCollection() {
    Logger.info('Script collection update')
    const tags = await Tag.query()
      .preload('project', (projectsQuery) => {
        projectsQuery.select(['readToken', 'writeToken'])
      })
      .where('type', 3)
      .orWhere('type', 4)
      .select(['id', 'name', 'projectId', 'script', 'type'])
      .andWhere('name', 'LIKE', 'mqtt%')
    const _scriptCollection: { [key: string]: Script } = {}
    for (const tag of tags) {
      if (tag.name.split('.')[0] == 'mqtt'.toLowerCase()) {
        _scriptCollection[tag.name] = {
          id: tag.id,
          type: tag.type,
          name: tag.name,
          projectId: tag.projectId,
          script: tag.script,
          readToken: tag.project.readToken,
          writeToken: tag.project.writeToken,
        }
      }
    }
    this.scriptCollection = _scriptCollection
  }
  /*
   * Increment device message counter
   */
  public incrementDeviceMsgCounter(clientId: string) {
    if (typeof this.deviceMsgStat[clientId] == 'undefined') {
      this.deviceMsgStat[clientId] = { msgCounter: 1 }
    } else {
      this.deviceMsgStat[clientId].msgCounter++
    }
    Logger.info(
      'Increment device counter -> ClientId: ' +
        clientId +
        ' Counter: ' +
        this.deviceMsgStat[clientId].msgCounter
    )
  }
  /*
   * Store in Warp10 MsgCounter for each device
   */
  public storeMsgMetrics() {
    const gtsCollections: WarpGts[][] = []
    for (const [key, value] of Object.entries(this.deviceMsgStat)) {
      const projectId = this.authorizesDevicesProjectId[key]
      const namespace = this.authorizesDevicesNamespace[key]
      if (typeof gtsCollections[projectId] == 'undefined') {
        gtsCollections[projectId] = []
        gtsCollections[projectId].push({
          classname: namespace + '.upMsgRate',
          labels: { type: 'hdMetric' },
          attributes: {},
          valueType: 2, // '2' -> Integer
          values: [{ value: value.msgCounter }],
        })
      } else {
        gtsCollections[projectId].push({
          classname: namespace + '.upMsgRate',
          labels: { type: 'hdMetric' },
          attributes: {},
          valueType: 2, // '2' -> Integer
          values: [{ value: value.msgCounter }],
        })
      }
      Logger.info(
        'Append counter to gtsCollection -> Device: ' +
          namespace +
          ' Counter: ' +
          this.deviceMsgStat[key].msgCounter
      )
      this.deviceMsgStat[key].msgCounter = 0
    }
    this.warp10Service.storeGtsCollection(gtsCollections, this.projectTokenCollection)
  }
}
