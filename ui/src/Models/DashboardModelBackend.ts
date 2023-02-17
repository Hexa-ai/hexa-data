import BaseModel from "./BaseModel";
import TileModel from "./TileModel";

class DashboardModelBackend extends BaseModel{
  public id:number =0
  public name:string =''
  public descriptionL1:string =''
  public descriptionL2:string =''
  public descriptionL3:string =''
  public body:string =''
  public stared:number =0
  public imgBg: any = null
  public enableImgBg:number =0
  public colorBg: string = '#FFFFFF'
  public type:string ='Discovery'
}

export default DashboardModelBackend
