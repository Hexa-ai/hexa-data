import JsRuntimeService from "./JsRuntimeService"
import Redis  from "@ioc:Adonis/Addons/Redis";
import { v4 as uuidv4 } from 'uuid';

export default class JsRuntimeMgmtService {
  constructor(){
    Redis.psubscribe('macro-cmd:*', (channel:string,message:string) => {
      const uuid = channel.split(':')[1]
      if (this.runtimesPoll[uuid]!=undefined && message=='stop') {
        this.stopMacro(uuid)
      }
    })
    // @ts-ignore
    Redis.psubscribe('mqttHook:*', async (channel:string,message:string)  => {
      const messageObj = JSON.parse(message)
      await this.exec(
        messageObj.projectId,
        messageObj.readToken,
        messageObj.writeToken,
        messageObj.macroName,
        messageObj.macroId,
        messageObj.script,
        messageObj.payload
      )
    })

  }
  destroy() {
    Redis.punsubscribe('macro-cmd:*');
    Redis.punsubscribe('mqttHook:*');
  }
  /**
   *
   * JsRuntime instance list
   *
   */
  public runtimesPoll:{[key: string ]: JsRuntimeService} = {}

  /**
   *
   * Create a new runtime service and start the macro
   *
   * @param projectId
   * @param readToken
   * @param writeToken
   * @param macroId
   */
  public async startMacro(projectId: number, readToken: string, writeToken: string, macroName:string, macroId:number, script:string, payload?:{}): Promise<string|null>{
    if ((await Redis.get('macro-' + macroId.toString())) == null) {
      const uuid = uuidv4()
      this.runtimesPoll[uuid] = new JsRuntimeService(projectId,readToken,writeToken,macroName,macroId,uuid,()=>{delete this.runtimesPoll[uuid]})
      this.runtimesPoll[uuid].start(script,payload??{})
      await Redis.set('macro-' + macroId.toString(), uuid)
      return uuid
    } else {
      return null
    }
  }
  /**
   * Stop macro
   *
   * @param uuid
   */
  public async stopMacro(uuid:string): Promise<void> {
    Redis.del('macro-' + this.runtimesPoll[uuid].macroId.toString())
    this.runtimesPoll[uuid].stop()
  }
   /**
   *
   * Create a new runtime service and exec synchronously the macro and return result
   *
   * @param projectId
   * @param readToken
   * @param writeToken
   * @param macroId
   */
   public async exec(projectId: number, readToken: string, writeToken: string, macroName:string, macroId:number,script:string, payload?:{}): Promise<string>{
    const uuid = uuidv4()
    this.runtimesPoll[uuid] = new JsRuntimeService(projectId,readToken,writeToken,macroName,macroId,uuid,()=>{delete this.runtimesPoll[uuid]})
    return await this.runtimesPoll[uuid].exec(script,payload??{})
  }
  public init():boolean{
    return true
  }
}
