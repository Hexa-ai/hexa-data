import { BaseTask } from 'adonis5-scheduler/build'
import Project from '../Modules/Projects/Models/Project'
import Logger from '@ioc:Adonis/Core/Logger'

export default class Warp10TokenRegeneration extends BaseTask {
  public static get schedule() {
    return '00 00 01 * * *'
    //return '* * * * * *'
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    Logger.info('---- Update of all project token -----')
    Project.updateAllTokens()
  }
}
