/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
| This file is read automatically by the framework during the boot lifecycle
| and hence do not rename or move this file to a different location.
|
*/

import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
  HOST: Env.schema.string({ format: 'host' }),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  DRIVE_DISK: Env.schema.enum(['local'] as const),
  NODE_ENV: Env.schema.enum(['development', 'production', 'testing'] as const),

  WARP10_ENDPOINT: Env.schema.string(),
  WARP10_SECRET: Env.schema.string(),
  WARP10_APP_NAME: Env.schema.string(),
  WARP10_TOKEN_DURATION: Env.schema.number(),
  WARP10_TEMPLATES_PATH: Env.schema.string(),
  MQTT_SUBSCRIBER_CLIENTID: Env.schema.string(),
  MQTT_SUBSCRIBER_USERNAME: Env.schema.string(),
  MQTT_SBSCRIBER_PASSWORD: Env.schema.string(),
  MQTT_API_URL: Env.schema.string(),
  MQTT_API_USER: Env.schema.string(),
  MQTT_API_PASSWORD: Env.schema.string(),
  HD_SCRIPT_INTERVAL_FACTOR: Env.schema.number(),
  HD_VERSION: Env.schema.string(),
  HD_API_URL: Env.schema.string(),
  QUEUE_REDIS_HOST:Env.schema.string({ format: 'host' }),
  QUEUE_REDIS_PORT:Env.schema.number(),
  QUEUE_REDIS_PASSWORD:Env.schema.string(),
  WARPFLEET_SYNCHRONISER_URL_PREFIX:Env.schema.string(),
  EMAIL_FROM:Env.schema.string(),
  APP_DOMAIN:Env.schema.string(),
})
