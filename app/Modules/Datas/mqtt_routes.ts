import { MqttMessage } from './Contracts/MqttMessage'
import MetricsControllerUns from './Controllers/Mqtt/MetricsControllerUns'

const metricsControllerUns = new MetricsControllerUns()

export default async ({ mqttMessage }: { mqttMessage: MqttMessage }) => {
  if (mqttMessage.action == 'metrics') {
    if (mqttMessage.params[0] === 'uns') {
      await metricsControllerUns.handle(mqttMessage)
      return
    }
  }

  throw new Error('no route matching the topic')
}
