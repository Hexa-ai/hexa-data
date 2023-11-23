import BaseModel from "./BaseModel";
import UserModel from "./UserModel";


class ProjectModel extends BaseModel {
  public id: number = 0
  public uuid: string =''
  public name: string =''
  public description: string =''
  public adress: string =''
  public long: number =0
  public lat: number =0
  public l1: string=''
  public l2: string=''
  public l3: string=''
  public readToken: string=''
  public writeToken: string=''
  public tokenIssuance: string=''
  public tokenExpiry: string=''
  public persistentReadToken: string=''
  public persistentWriteToken: string=''
  public persistentTokenIssuance: string=''
  public persistentTokenExpiry: string=''
  public dashboardType: string ='LEGACY'
  public dashboardGrafanaUrl: string =''
  public dashboardGrafanaWritePassword: string =''
  public dashboardGrafanaReadPassword: string =''

  // 0|null -> no Cmd, 1 -> Import, 2 -> Export, 3 -> Export in progress, 4 -> Archive in progress, 5 -> Export done
  // 10 -> Unarchive in progress, 11 -> Import in progress, 12 -> Import done
  public importExportCmd: number = 0
  public importExportParameters: string =''
  public archive?: any = null
  public exportLink: string =''
  public exportLinkExpiry: string =''
  public photo: any = null
  public users:UserModel[] = []
  public owner:UserModel = new UserModel()
}

export default ProjectModel
