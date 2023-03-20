import BaseModel from "./BaseModel";
import DeviceModel from "./DeviceModel";

export default class Tag extends BaseModel {

  public id: number =0
  public name: string =''
  public descriptionL1: string =''
  public descriptionL2: string =''
  public descriptionL3: string =''
  public unit: string =''
  public type: number =0 // type values -> 1 GTS, 2 GTS for Text traduction, 3 WARPScript
  public valueType: number =0 // value_type values -> 1 Boolean, 2 -> Integer, 3 -> Float, 4 -> String
  public alarm?: boolean = false
  public minTreshold?: number = 0
  public maxTreshold?: number = 0
  public triggerType?: 'rising' | 'falling'
  public script: string =''
  public scriptOutput: string =''
  public scriptInterval: number =0
  public scriptLastExec: string =''
  public projectId: number =0
  public deviceId?: number
  public device?: DeviceModel
  public updatedAt?: string
}
