import { Context } from './Context'
import { Warp10 } from '@senx/warp10'

export class HexaData {
  constructor (projectId:number, warp10EndPoint:string, readToken:string, writeToken:string, parentPort:any,macroId?:number) {
    this.projectId=projectId
    this.macroId=macroId
    this.warp10EndPoint=warp10EndPoint
    this.readToken=readToken
    this.writeToken=writeToken
    this.warp10 = new Warp10(this.warp10EndPoint)
    this.parentPort = parentPort
    this.macroCtx = new Context('Project-' + this.projectId.toString() + ':Macro-' + this.macroId?.toString()??'_', this.parentPort)
    this.projectCtx = new Context('Project-' + this.projectId.toString(), this.parentPort)
    this.appCtx = new Context('App', this.parentPort)



  }
  /**
   * Parent port for workerthread parent messaging
   *
   */
  private parentPort:MessagePort
  /**
   *
   * Project Warp10 ReadToken
   *
   */
  private readToken:string
  /**
   *
   * Project Warp10 WriteToken
   *
   */
  // @ts-ignore
  private writeToken:string
  /**
   *
   * Warp10 Endpoint URL
   *
   */
  private warp10EndPoint:string
  /**
   *
   * Macro Id
   *
   */
  private macroId?:number

  /**
   *
   * Macro ProjectId
   *
   */
  private projectId:number

  /**
   *
   * Macro context
   *
   */
  public macroCtx:Context
  /**
   *
   * Project context
   *
   */
  public projectCtx:Context
  /**
   *
   * Apllication context
   *
   */
  public appCtx:Context

  /**
   * Warp10 library instance
   */
  private warp10:Warp10
  /**
   * Exec WarpScript (can call Hexa-data WarpScript macros @project/macroName)
   *
   * @returns Promise<{output: any[], execError:string, elapsed:number}>
   */
  public async wsExec(warpscript:string):Promise<string | null> {
    return new Promise<string | null> ((resolve) => {
      this.parentPort.postMessage({wsExec:{script:warpscript}});

      const messageHandler = (payload) => {
          if('wsExec_response' in payload) {
            resolve(payload.wsExec_response);
          }
      };
      // @ts-ignore
      this.parentPort.on('message', messageHandler);
    });
  }
  /**
   * Fetch Variables/GTS on the Warp10 project timeseries storage
   *
   * @returns Promise<{output: any[], execError:string, elapsed:number}>
   */
  public async wsFetch(className:string,labels:{},start:string, end:string):Promise<string[]> {
    let result =  (await this.warp10.fetch(this.readToken,className,labels,start,end,"json")).result

    result= result.map((line)=>{
      return JSON.parse(line)
    })
    return result
  }
  /**
   * Import Javascript macro from project
   *
   * @param name:string
   * @returns Promise<any>
   */
  public async import(name:string):Promise<string | null> {
    return new Promise<string | null> ((resolve) => {
      this.parentPort.postMessage({jsImport:{name:name}});

      const messageHandler = (payload) => {
          if('jsImport_response' in payload) {
            resolve(payload.jsImport_response);
          }
      };
      // @ts-ignore
      this.parentPort.on('message', messageHandler);
    });
  }

}
