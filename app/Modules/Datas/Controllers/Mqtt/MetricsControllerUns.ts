import Project from 'App/Modules/Projects/Models/Project'
import { MqttMessage } from '../../Contracts/MqttMessage'
import Warp10Ingress from '../../Services/Ingress/Warp10Ingress'
import Logger from '@ioc:Adonis/Core/Logger'

const REFRESH_TOKENS_INTERVAL = 10 // In seconds

export default class MetricsControllerV1 {
  protected ingress: any
  protected projectTokens: Record<string, string>

  public constructor() {
    this.ingress = new Warp10Ingress()

    setInterval(() => {
      this.refreshTokens()
    }, REFRESH_TOKENS_INTERVAL * 1000)
    this.refreshTokens()
  }

  public async handle(mqttMessage: MqttMessage) {
    const token = this.projectTokens[mqttMessage.projectUuid]
    if (!token) {
      Logger.error('Received a message for an unknown project: ' + mqttMessage.projectUuid)
      return
    }

    // Build the default payload (with timestamp)
    const payload = {
      timestamp: Date.now(),
      ...mqttMessage.payload,
    }

    // Lower the timestamp precision to second
    payload.timestamp = Math.floor(payload.timestamp / 1000) * 1000

    // Pushing all entries of the payload to the ingress
    for (let [key, value] of Object.entries(payload)) {
      // Ignore reserved words like timestamp
      if (['timestamp'].includes(key)) {
        continue
      }

      // Ignore all non primitive boolean, string or number values
      if (!['boolean', 'string', 'number'].includes(typeof value)) {
        continue
      }

      // Prepare labels
      let labels: any = {
        alarm: false,
        unit: '',
      }

      // If the key is at the uns format (with 4 or 5 dots), we fill the labels
      if ((key.match(/\./g) || []).length >= 4) {
        const [domain, location, device, func, carac, unit = ''] = key.split('.')
        labels = { ...labels, domain, location, device, func, carac, unit }
      }

      // If the key ends with .unit, we need to remove it from the key
      if (key.endsWith('.unit')) {
        key = key.slice(0, -5)
      }

      // Push the value to the ingress
      await this.ingress.push({
        token: this.projectTokens[mqttMessage.projectUuid],
        classname: key,
        value,
        labels,
        timestamp: payload.timestamp,
      })
    }
  }

  // The method for refreshing the project tokens
  protected async refreshTokens() {
    this.projectTokens = {}
    for (const project of await Project.all()) {
      this.projectTokens[project.uuid] = project.writeToken
    }

    Logger.info('Refreshed ' + Object.keys(this.projectTokens).length + ' project tokens')
  }
}
