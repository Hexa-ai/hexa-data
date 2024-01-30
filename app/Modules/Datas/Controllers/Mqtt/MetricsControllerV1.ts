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

    // Extract the item name prefix (if any, can be multiple nested levels into topic)
    let itemNamePrefix = mqttMessage.params.length > 1 ? '' : null
    for (let i = 1; i < mqttMessage.params.length; i++) {
      itemNamePrefix += mqttMessage.params[i] + '.'
    }

    // Handle each payload individually
    for (const payload of payloads) {
      // Extract special attributs and push the other into items
      const { ts = Date.now(), tags = {}, ...items } = payload

      // Now push all the items to the ingress
      for (const [key, value] of Object.entries(items)) {
        await this.ingress.push({
          token: this.projectTokens[mqttMessage.projectId],
          classname: itemNamePrefix ? itemNamePrefix + key : key,
          value,
          labels: { ...tags, topic: mqttMessage.topic },
          timestamp: ts,
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
