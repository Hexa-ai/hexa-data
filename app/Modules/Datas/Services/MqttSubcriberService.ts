import Env from '@ioc:Adonis/Core/Env'
import mqtt from 'mqtt'
import Logger from '@ioc:Adonis/Core/Logger'
import crypto from 'crypto'
import { MqttMessage } from '../Contracts/MqttMessage'
import dispatchRouting from '../mqtt_routes'

export default class MqttSbuscriberService {
  constructor() {
    // Load Env variables
    this.mqttEndpoint = Env.get('MQTT_ENDPOINT')
    this.clientId = Env.get('MQTT_SUBSCRIBER_CLIENTID') + '_' + crypto.randomUUID()
    this.username = Env.get('MQTT_SUBSCRIBER_USERNAME')
    this.password = Env.get('MQTT_SBSCRIBER_PASSWORD')
    // Delays the MQTT connexion
    setTimeout(() => {
      const client = mqtt.connect(this.mqttEndpoint, {
        clientId: this.clientId,
        username: this.username,
        password: this.password,
      })

      client.on('connect', function () {
        console.log('---- MQTT Subscriber Connected ----')
        client.subscribe(['$share/g1/HD/+/#'], function () {})
      })

      // New message routing and handling
      client.on('message', (topic, message) => this.routeMessage(topic, message))
    }, 5000)
  }

  // Env vars
  public mqttEndpoint: string
  public clientId: string
  public username: string
  public password: string

  /*
   * Handle new mqtt message routing
   * Accepted format is : HD/<projectUuid>/<action>/<...params>
   */
  public async routeMessage(topic: string, message: Buffer) {
    try {
      // Parse the mqtt topic/message into a MqttMessage object
      const [prefix = 'HD', projectUuid = null, action = null, ...params] = topic.split('/')

      // Verify if the project Uuid exists
      if (projectUuid === null) {
        throw new Error('the projectUuid parameter is missing in the topic')
      }

      // Verify if any action is specified
      if (action === null) {
        throw new Error('the action parameter is missing in the topic')
      }

      // Parse the payload as object
      const payload: any = JSON.parse(message.toString())

      // Build up the MqttMessage, and dispatch it to the routes
      const mqttMessage: MqttMessage = { topic, prefix, projectUuid, action, params, payload }
      await dispatchRouting({ mqttMessage })
    } catch (e) {
      Logger.warn('Could not route mqtt message ' + topic + ':' + e.message)
    }
  }
}
