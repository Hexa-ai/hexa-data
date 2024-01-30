export interface MqttMessage {
  topic: string, // The message topic
  prefix: string, // The prefix (HD)
  projectUuid: string, // The project UUID
  projectId: number, // The project ID
  action:string, // The target action (for now, only metrics)
  params: Array<string>, // The params to the action
  payload: any // The message payload
}
