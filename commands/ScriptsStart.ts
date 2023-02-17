import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class ScriptsStart extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'scripts:start'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Start the user script runner'

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
    const UserScriptService = (await import('App/Modules/Datas/Services/UserScriptService')).default
    new UserScriptService()
    this.logger.info('---- UserScript Runner Starting -----')
  }
}
