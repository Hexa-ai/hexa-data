import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class Background extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'background'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Start the background services (sould be started only once)'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process
     */
    stayAlive: true,
  }

  public async run() {
    const runtimeManager = (await import('@ioc:JsRuntime/RuntimeManager')).default
    runtimeManager.destroy()

    await this.startMqttSub()
    await this.startUserScript()

    await this.handleTelegrafRedisMessages()
  }

  protected async startMqttSub() {
    const MqttSbuscriberService = (await import('App/Modules/Datas/Services/MqttSubcriberService'))
      .default
    new MqttSbuscriberService()
    this.logger.info('---- MQTT Subscriber Starting -----')
  }

  protected async startUserScript() {
    const UserScriptService = (await import('App/Modules/Datas/Services/UserScriptService')).default
    new UserScriptService()
    this.logger.info('---- UserScript Runner Starting -----')
  }

  protected async handleTelegrafRedisMessages() {
    const TelegrafService = (await import('App/Services/TelegrafService')).default
    TelegrafService.handleRedisMessages()
  }
}
