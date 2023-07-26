import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class MqttSub extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'mqtt:sub'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Start mqtt subcriber in charge to ingress data from MQTT to Warp10'

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

    const MqttSbuscriberService = (await import('App/Modules/Datas/Services/MqttSubcriberService')).default
    new MqttSbuscriberService()
    this.logger.info('---- MQTT Subscriber Starting -----')
  }
}
