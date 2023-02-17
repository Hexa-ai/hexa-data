import Env from '@ioc:Adonis/Core/Env'

export const OvhAPiConfig = {
  endpoint: 'ovh-eu',
  appKey: Env.get('OVH_APP_KEY'),
  appSecret: Env.get('OVH_APP_SECRET'),
  consumerKey: Env.get('OVH_CONSUMER_KEY'),
}
