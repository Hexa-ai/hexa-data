import { Worker } from 'worker_threads';
import Config from '@ioc:Adonis/Core/Config'
import Env from '@ioc:Adonis/Core/Env'
import Redis from '@ioc:Adonis/Addons/Redis'
import Warp10Service from 'App/Services/Warp10Service'
import Ws from 'App/Services/Ws'
import Tag from 'App/Modules/Datas/Models/Tag';
import Application from '@ioc:Adonis/Core/Application'

type CallbackFunction = () => void;

export default class JsRuntimeService {



  constructor(projectId: number, readToken: string, writeToken: string, macroName:string,macroId:number, uuid:string, callbackStopFunction:CallbackFunction) {
    this.projectId = projectId;
    this.readToken = readToken
    this.writeToken = writeToken
    this.macroName = macroName
    this.uuid = uuid
    this.callbackStopFunction=callbackStopFunction
    this.macroId=macroId
  }

  private callbackStopFunction:CallbackFunction
  /**
   *
   * Macro id
   *
   */
  public macroId:number
  /**
   *
   * JsRuntime execution uuid
   *
   */
  public uuid: string
  /**
   *
   * Macro Id
   *
   */
  private macroName: string

  /**
   *
   * Macro ProjectId
   *
   */
  private projectId: number
  /**
   *
   * Project Warp10 ReadToken
   *
   */
  private readToken: string
  /**
   *
   * Project Warp10 WriteToken
   *
   */
  private writeToken: string

  /**
   *
   * Script to execute
   *
   */
  private script: string;

  /**
   *
   * WorkerThread worker instance
   *
   */
  private worker:Worker

  /**
   *
   * Start async Javascript script in workerthread
   *
   * @param script
   * @returns
   */
  public async start(script: string, payload:{}): Promise<void> {
    this.script = `async function main(payload){
      ${script}
    }
    main(payload)
    `
    this.startWorker(this.script, payload )
  }
  /**
   *
   * Run synchronously Javascript script in workerthread and return result
   *
   * @param script
   * @returns
   */
  public async exec(script: string, payload:{}): Promise<any> {
    this.script = `function main(payload){
      ${script}
    }
    main(payload)
    `
    const output: any = await this.startWorker(this.script, payload)
    await this.stop()
    return output
  }

  /**
   *
   * Stop Javascript script execution
   *
   */
  public async stop(): Promise<void> {
    console.log('before terminate')
    await this.worker.terminate();
    this.callbackStopFunction()
  }

  private startWorker(script:string, payload:{}) {
    return new Promise((resolve, reject) => {
      if(Application.inProduction){
        this.worker = new Worker(`./app/Services/worker.js`),{ type: 'module' };
      }else{
        this.worker = new Worker(`./app/Services/worker.ts`),{ type: 'module' };
      }


      this.worker.on('message', async (payload) => {
        if ('execResult' in payload) {
          Redis.publish('macro-cmd:'+ this.uuid, 'stop' )
          Ws.io.emit('macro-result-log:'+ this.uuid, payload.execResult)
          resolve(payload.execResult);
        }
        if ('consoleLog' in payload) {
          Redis.publish('macro-log:'+ this.uuid, payload.consoleLog.message )
          Ws.io.emit('macro-log:'+ this.uuid, payload.consoleLog.message)
        }
        if ('redisHset' in payload) {
          await Redis.hset(payload.redisHset.scope, payload.redisHset.name, payload.redisHset.value)
          this.worker.postMessage({ redisHset_response: true })
        }
        if ('redisHget' in payload) {
          const result = await Redis.hget(payload.redisHget.scope, payload.redisHget.name)
          this.worker.postMessage({ redisHget_response: result })
        }
        if ('jsImport' in payload) {

          const result = await Tag.query().where('projectId', this.projectId).andWhere('name',payload.jsImport.name).andWhere('type',4).firstOrFail()
          this.worker.postMessage({ jsImport_response: result.script })
        }

        if ('wsExec' in payload) {
          const warp10Service = new Warp10Service()
          let result = await warp10Service.exec(
            payload.wsExec.script,
            this.readToken,
            this.writeToken,
            {},
            this.projectId,
          )

          //{ wsExec_response: { output: result['data'], execError: result.header('x-warp10-error-message', result.headers['x-warp10-error-message']), elapsed: result.header('x-warp10-ops', result.headers['x-warp10-elapsed']) } }
          this.worker.postMessage({
            wsExec_response: {
              output: result['data'],
              execError: result.headers['x-warp10-error-message'],
              elapsed: result.headers['x-warp10-elapsed']
            }
          })
        }

      });

      this.worker.on('error', (error) => {
        reject(error);
      });

      const redisConfig = {
        host: Config.get('redis.connections.local.host'),
        port: Config.get('redis.connections.local.port'),
        password: Config.get('redis.connections.local.password')
      }
      // const redis = new Redis({
      //   host: redisConfig.host,
      //   port: redisConfig.port,
      //   password: redisConfig.password,
      //   // Autres options de configuration si nécessaire
      // });
      this.worker.postMessage({ script: script, payload:payload, projectId: this.projectId, readToken: this.readToken, writeToken: this.writeToken, redisConfig: redisConfig, macroName: this.macroName, warp10EndPoint: Env.get('WARP10_ENDPOINT') });
    });
  }
}
