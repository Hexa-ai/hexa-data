import Env from '@ioc:Adonis/Core/Env'
import Tag from '../Models/Tag'
import { DateTime } from 'luxon'
import Warp10Service from 'App/Services/Warp10Service'
import Logger from '@ioc:Adonis/Core/Logger'

interface Script {
  id: number,
  name: string,
  projectId: number,
  scriptInterval: number,
  script: string,
  scriptOutput: { [key: number]: {} },
  readToken: string,
  writeToken: string,
  started: boolean,
  cycleNumber: number
}

export default class UserScriptService {
  constructor() {
    this.scriptCollection = {}
    this.warp10Service = new Warp10Service()
    this.scriptCollectionUpdateInterval = 10000
    this.storeResultsUpdateInterval = 10000
    this.scriptTriggerBaseInterval = Env.get('HD_SCRIPT_INTERVAL_FACTOR')

    // Cyclical script collection update
    setInterval(() => {
      this.getScriptCollection()
    }, this.scriptCollectionUpdateInterval)

    // Delay the first start of the loop after listing the scripts
    setTimeout(() => {
      this.startLoop()
    }, this.scriptCollectionUpdateInterval + 1000)
  }
  protected warp10Service: Warp10Service
  protected scriptCollection: { [key: string]: Script }

  // Script collection update interval in millisecond
  readonly scriptCollectionUpdateInterval: number
  // Script result store interval in millisecond
  readonly storeResultsUpdateInterval: number
  // Script trigger interval in millisecond
  readonly scriptTriggerBaseInterval: number
  /**
   * Start script execution loop
   */
  protected startLoop() {
    setInterval(() => {
      this.checkSriptToStart()
    }, this.scriptTriggerBaseInterval)

    setInterval(() => {
      this.storeResults()
    },  this.storeResultsUpdateInterval)
  }
  /**
   * Retreive script collection from DB tags tab
   */
  protected async getScriptCollection() {
    Logger.info('Script collection update')
    const tags = await Tag.query()
      .preload('project', (projectsQuery) => {
        projectsQuery.select(['readToken', 'writeToken'])
      }).where('type', 3).where('scriptInterval','>', 0).select(['id', 'name', 'projectId', 'scriptInterval', 'script', 'type'])

    for (const tag of tags) {
      if (typeof (this.scriptCollection[tag.id]) == 'undefined') {
        this.scriptCollection[tag.id] = {
          id: tag.id,
          name: tag.name,
          projectId: tag.projectId,
          scriptInterval: tag.scriptInterval,
          script: tag.script,
          scriptOutput: {},
          readToken: tag.project.readToken,
          writeToken: tag.project.writeToken,
          started: false,
          cycleNumber: 1
        }
      } else {
        if(this.scriptCollection[tag.id].scriptInterval!=tag.scriptInterval || this.scriptCollection[tag.id].script!=tag.script){
          this.scriptCollection[tag.id].started=false
          this.scriptCollection[tag.id].cycleNumber=1
        }
        this.scriptCollection[tag.id].id = tag.id
        this.scriptCollection[tag.id].name = tag.name
        this.scriptCollection[tag.id].projectId = tag.projectId
        this.scriptCollection[tag.id].scriptInterval = tag.scriptInterval
        this.scriptCollection[tag.id].script = tag.script
        this.scriptCollection[tag.id].readToken = tag.project.readToken
        this.scriptCollection[tag.id].writeToken = tag.project.writeToken
      }
    }
  }
  /**
   * Check script to start from script collection
   */
  protected checkSriptToStart() {
    const scriptCollection = this.scriptCollection
    for (var index in scriptCollection) {
      if ((scriptCollection[index].cycleNumber >= scriptCollection[index].scriptInterval*(1000/this.scriptTriggerBaseInterval)) && (scriptCollection[index].scriptInterval > 0) && (scriptCollection[index].started == false)) {
        Logger.info('Cycle number: ' + scriptCollection[index].cycleNumber + ' Script Name: ' + scriptCollection[index].name)
        this.startScript(index)
      } else {
        //Logger.debug('Cycle number: ' + scriptCollection[index].cycleNumber)
        scriptCollection[index].cycleNumber++
      }
    }
    this.scriptCollection = scriptCollection
  }
  /**
   * Start Script (Async) and log the result
   *
   * @param index id from tags tab
   */
  protected async startScript(index: string) {
    Logger.info('Start script:' + index)
    this.scriptCollection[index].started = true
    var result:any
    try {
      result = await this.warp10Service.scriptExec(this.scriptCollection[index].script, this.scriptCollection[index].readToken, this.scriptCollection[index].writeToken, this.scriptCollection[index].projectId)
    } catch (error) {
      this.scriptCollection[index].scriptOutput[DateTime.now().toMillis()]=String(error)
      this.scriptCollection[index].started = false
      this.scriptCollection[index].cycleNumber = 1
    }

    this.scriptCollection[index].scriptOutput[DateTime.now().toMillis()]=result
    this.scriptCollection[index].started = false
    this.scriptCollection[index].cycleNumber = 1

  }
  /**
   * Store buffer of result in DB tag tab
   */
  protected async storeResults() {
    for (var index in this.scriptCollection) {
      const tag = await  Tag.find(this.scriptCollection[index].id)
      if (tag!=null && JSON.stringify(this.scriptCollection[index].scriptOutput)!='{}') {
        tag.scriptOutput = JSON.stringify(this.scriptCollection[index].scriptOutput)
        console.log('Output to write: ' +tag.scriptOutput)
        await tag.save()

        this.scriptCollection[index].scriptOutput={}
      }
    }
  }
}
