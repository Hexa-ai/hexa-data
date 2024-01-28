import Project from 'App/Modules/Projects/Models/Project'
import { MqttMessage } from '../../Contracts/MqttMessage'
import Warp10Ingress from '../../Services/Ingress/Warp10Ingress'

const REFRESH_TOKENS_INTERVAL = 10 // In seconds

export default class MetricsController {
  protected ingress: any
  protected projectTokens: Record<string, string>

  public constructor() {
    this.ingress = new Warp10Ingress()

    setInterval(this.refreshTokens, REFRESH_TOKENS_INTERVAL * 1000)
    this.refreshTokens()
  }

  public async handle(mqttMessage: MqttMessage) {
    // Force the payload to be an array of payloads
    const payloads = Array.isArray(mqttMessage.payload)
      ? mqttMessage.payload
      : [mqttMessage.payload]

    // Extract the item name prefix
    const itemNamePrefix = mqttMessage.params[1] || null

    // Handle each payload individually
    for (const payload of payloads) {
      // Extract special attributes
      const timestamp = payload.ts || Date.now()
      const tags = payload.tags || {}

      // Items will contain all the payload attributs except "ts" and "tags"
      const items = {
        ...payload,
        ts: undefined,
        tags: undefined,
      }.filter((item) => item !== undefined)

      // Now push all the items to the ingress
      for (const key of items) {
        const value = items[key]
        await this.ingress.push({
          token: this.projectTokens[mqttMessage.projectId],
          classname: itemNamePrefix ? itemNamePrefix + '.' + key : key,
          value,
          labels: tags,
          timestamp,
        })
      }
    }
  }

  // The method for refreshing the project tokens
  protected async refreshTokens() {
    this.projectTokens = {}
    for (const project of await Project.all()) {
      this.projectTokens[project.id] = project.writeToken
    }
  }
}
