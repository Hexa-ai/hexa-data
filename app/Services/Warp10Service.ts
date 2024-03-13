import Env from '@ioc:Adonis/Core/Env'
import { string } from '@ioc:Adonis/Core/Helpers'
import { DateTime } from 'luxon'
import crypto from "crypto";
import { readFileSync } from 'fs'
import { Warp10 } from "@senx/warp10"
import os from 'os'
import axios from 'axios'
import Logger from '@ioc:Adonis/Core/Logger'

interface WarpReadToken {
  type: string,
  application: string,
  owner: string,
  issuance: number,
  expiry: number,
  labels: {},
  owners: string[],
  producers: string[],
  applications: string[],
  attributes: {},
}
interface WarpWriteToken {
  type: string,
  application: string,
  owner: string,
  issuance: number,
  expiry: number,
  labels: {},
  attributes: {},
  producer: string,
}
export interface WsExecResult {
  result: any[],
  meta: {
    elapsed: number,
    ops: number,
    fetched: number,
  }
}
export interface WsError {
  description: string,
  content: any,
}
export interface gtsValue {
  ts?: number,
  value: number | boolean | string,
}
export interface WarpGts {
  classname: string,
  labels: {},
  attributes?: {},
  valueType?: number, // value_type values -> '1' Boolean, '2' -> Integer, '3' -> Float, '4' -> String
  values?: gtsValue[]
}

interface TokenInfo {
  readToken: string,
  writeToken: string,
  issuance: DateTime,
  expiry: DateTime,
  uuid: string,
}
export default class Warp10Service {
  constructor() {
    this.warp = new Warp10(Env.get('WARP10_ENDPOINT'))
  }

  public warp: Warp10

  /**
   * Get actual timestamp in microseconde.
   */
  public now(): number {
    return Date.now() * 1000
  }
  /**
   * Generate read en write token for a project.
   *
   * @param labels object Object containing labels for the token
   * @param actualUuid string the uuid of the project
   * @param duration duration the duration of the token in seconds (default is WARP10_TOKEN_DURATION)
   * @return TokenInfo Warp10 Tokens for this project
   */
  public async generatePairOfTokens(labels: {}, actualUuid?: string, duration?: number) {
    if(!duration) {
      duration = Env.get('WARP10_TOKEN_DURATION')
    }

    const issuance = this.now()
    const issuanceSec = parseInt((issuance / 1000000).toFixed())
    const expiry = issuance + (1000000 * duration)
    const expirySec = parseInt((expiry / 1000000).toFixed())
    let uuid: string = ""
    if (typeof (actualUuid) == 'undefined') {
      uuid = crypto.randomUUID()
    } else {
      uuid = actualUuid!
    }

    const readToken: WarpReadToken = {
      type: 'READ',
      application: string.camelCase(Env.get('WARP10_APP_NAME')),
      owner: uuid,
      issuance: issuance,
      expiry: expiry,
      labels: labels,
      owners: [uuid],
      producers: [uuid],
      applications: [string.camelCase(Env.get('WARP10_APP_NAME'))],
      attributes: {
        '.cap:limits':  '',
        '.cap:tokendump': ''
      }
    }
    const writeToken: WarpWriteToken = {
      type: 'WRITE',
      application: string.camelCase(Env.get('WARP10_APP_NAME')),
      owner: uuid,
      producer: uuid,
      issuance: issuance,
      expiry: expiry,
      labels: labels,
      attributes: {
        '.cap:limits':  '',
        '.cap:tokendump': ''
      }
    }
    // Exec tokengen request to Warp10 for read token
    const resultReadToken = await this.warp.exec('\'' + Env.get('WARP10_MASTER_READ_TOKEN') + '\' CAPADD ' + '\'' + JSON.stringify(readToken) + '\' JSON-> TOKENGEN')
    // Exec tokengen request to Warp10 for write token
    const resultWriteToken = await this.warp.exec('\'' + Env.get('WARP10_MASTER_READ_TOKEN') + '\' CAPADD ' + '\'' + JSON.stringify(writeToken) + '\' JSON-> TOKENGEN')
    const generatedTokens: TokenInfo = {
      readToken: resultReadToken.result[0].token,
      writeToken: resultWriteToken.result[0].token,
      issuance: DateTime.fromSeconds(issuanceSec),
      expiry: DateTime.fromSeconds(expirySec),
      uuid: uuid,
    }

    return generatedTokens
  }
  public async storeGtsCollection(gtsCollections: WarpGts[][], tokenCollection: string[]): Promise<void> {
    for (const index in gtsCollections) {
      let file = Warp10Service.wsLoadTemplate('insert.mc2')
      file = Warp10Service.wsAppendString(file, JSON.stringify(gtsCollections[index]))
      file = Warp10Service.wsAppendToken(file, tokenCollection[index], 'writeToken')
      try {
        await this.warp.exec(file)
      } catch (error) {
        Logger.error('StoreGtsCollection Exec error:' + error.toString())
      }
    }

  }
  public async createGts(gtsCollection: WarpGts[], readToken: string, writeToken: string): Promise<WsExecResult | WsError> {
    let file = Warp10Service.wsLoadTemplate('update.mc2')
    file = Warp10Service.wsAppendString(file, JSON.stringify(gtsCollection))
    file = Warp10Service.wsAppendTokens(file, readToken, writeToken)
    let result: WsExecResult
    try {
      result = <WsExecResult>await this.warp.exec(file)
      return result
    } catch (error) {
      const errorResult: WsError = {
        description: 'createGts Exec error',
        content: error.toString()
      }
      Logger.error('CreateGts Exec error:' + error.toString())
      return errorResult
    }

  }
  public async deleteGts(gtsCollection: WarpGts[], readToken: string, writeToken: string): Promise<WsExecResult | WsError> {
    let file = Warp10Service.wsLoadTemplate('delete.mc2')
    file = Warp10Service.wsAppendString(file, JSON.stringify(gtsCollection))
    file = Warp10Service.wsAppendToken(file, readToken, 'readToken')
    file = Warp10Service.wsAppendToken(file, writeToken, 'writeToken')
    let result: WsExecResult

    try {
      result = <WsExecResult>await this.warp.exec(file)
      return result
    } catch (error) {
      const errorResult: WsError = {
        description: 'deleteGts Exec error',
        content: error.toString()
      }
      Logger.error('DeleteGts Exec error:' + error.toString())
      return errorResult
    }
  }
  public async searchGts(readToken: string, writeToken: string, search: string): Promise<WsExecResult | WsError> {
    let file = Warp10Service.wsLoadTemplate('searchGts.mc2')
    file = Warp10Service.wsAppendToken(file, readToken, 'readToken')
    file = Warp10Service.wsAppendToken(file, writeToken, 'writeToken')
    file = Warp10Service.wsAppendVar(file, 'search', search)
    let result: WsExecResult

    try {
      result = <WsExecResult>await this.warp.exec(file)
      return result
    } catch (error) {
      const errorResult: WsError = {
        description: 'listGts Exec error',
        content: error.toString()
      }
      Logger.error('listGts Exec error:' + error.toString())
      return errorResult
    }
  }
  public static wsLoadTemplate(templateName: string): string {
    return readFileSync(Env.get('WARP10_TEMPLATES_PATH') + templateName, 'utf-8')
  }
  public static wsAppendTokens(script: string, readToken: string, writeToken: string): string {
    let output: string = ""
    output = "'" + readToken + "' 'readToken' STORE" + os.EOL + script
    output = "'" + writeToken + "' 'writeToken' STORE" + os.EOL + output

    return output
  }
  public static wsAppendToken(script: string, token: string, tokenName: string): string {
    let output: string = ""
    output = "'" + token + "' '" + tokenName + "' STORE" + os.EOL + script
    return output
  }
  public static wsAppendVar(script: string, name: string, value: string): string {
    let output: string = ""
    output = "'" + value + "' '" + name + "' STORE" + os.EOL + script
    return output
  }
  // public static wsAuth(script: string): string {
  //   let output: string = ""
  //   output = "$readToken AUTHENTICATE" + os.EOL + script
  //   return output
  // }
  public static wsAppendString(script: string, addedString: string): string {
    let output: string = "<'" + os.EOL + addedString + os.EOL + "'>" + os.EOL + script
    return output
  }
  public static wsAppendWarpScript(script: string, addedString: string): string {
    let output: string = os.EOL + addedString + os.EOL + script
    return output
  }
  public static wsReplaceMacroProjectPrefixe(script: string, projectId: number): string {
    const projectPrefix = "@project/";
    const replacement = "@" + projectId.toString() + "/";

    return script.replace(new RegExp(projectPrefix, 'g'), replacement);
  }
  public async scriptExec(script: string, readToken: string, writeToken: string, projectId:number): Promise<WsExecResult | WsError> {
    let fullScript: string =''
    fullScript = Warp10Service.wsAppendWarpScript(fullScript,script)
    //fullScript = Warp10Service.wsAuth(fullScript)
    fullScript = Warp10Service.wsAppendVar(fullScript,'hdUrl',Env.get('HD_API_URL').split('/api/v1')[0])
    fullScript = Warp10Service.wsAppendVar(fullScript,'hdApiUrl',Env.get('HD_API_URL'))
    fullScript = Warp10Service.wsAppendToken(fullScript,readToken,'readToken')
    fullScript = Warp10Service.wsAppendToken(fullScript,writeToken,'writeToken')
    fullScript = Warp10Service.wsReplaceMacroProjectPrefixe(fullScript,projectId)

    let result: WsExecResult

    try {
      result = <WsExecResult>await this.warp.exec(fullScript)
      return result
    } catch (error) {
      const errorResult: WsError = {
        description: 'ScriptExec Exec error',
        content: error.toString()
      }
      Logger.error('ScriptExec Exec error:' + error.toString())
      return errorResult
    }

  }
  public async exec(script: string, readToken:string,writeToken: string, requestParams:any, projectId:number, description?:string): Promise<any> {
    let fullScript = script
    if (description!=undefined) {
      fullScript = Warp10Service.wsAppendVar(fullScript,'language',<string>description)
    }
    for (const [key, value] of Object.entries(requestParams)) {
      fullScript = Warp10Service.wsAppendVar(fullScript,key,<string>value)
    }
    //fullScript = Warp10Service.wsAuth(fullScript)
    fullScript = Warp10Service.wsAppendVar(fullScript,'hdUrl',Env.get('HD_API_URL').split('/api/v1')[0])
    fullScript = Warp10Service.wsAppendVar(fullScript,'hdApiUrl',Env.get('HD_API_URL'))
    fullScript = Warp10Service.wsAppendToken(fullScript,readToken,'readToken')
    fullScript = Warp10Service.wsAppendToken(fullScript,writeToken,'writeToken')
    fullScript = Warp10Service.wsReplaceMacroProjectPrefixe(fullScript,projectId)
    let result: any
    try {
      result = await axios.post(Env.get('WARP10_ENDPOINT') + '/api/v0/exec',fullScript,{
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8'
        }
      })
    } catch (error) {
      result = error.response
      Logger.error('Exec Exec error:' + error.toString())
    }
    return result
  }
}
