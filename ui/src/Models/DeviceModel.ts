import BaseModel from "./BaseModel";


class DeviceModel extends BaseModel{
  public id: number=0
  public name: string=''
  public namespace: string=''
  public description: string=''
  public adress: string=''
  public long: number=0
  public lat: number=0
  public dashboardId: number=0
  public clientId: string=''
  public username: string=''
  public password: string=''
  public ip:string =''
  public connected:boolean =false
}

export default DeviceModel
