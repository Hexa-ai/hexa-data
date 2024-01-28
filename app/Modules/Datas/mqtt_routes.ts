import { MqttMessage } from './Contracts/MqttMessage'
import MetricsControllerV1 from './Controllers/Mqtt/MetricsControllerV1'

const metricsControllerV1 = new MetricsControllerV1()

export default async ({ mqttMessage }: { mqttMessage: MqttMessage }) => {
  if (mqttMessage.action == 'metrics') {
    if (mqttMessage.params[0] === 'v1') {
      await metricsControllerV1.handle(mqttMessage)
      return
    }
  }

  throw new Error('no route matching the topic')
}
