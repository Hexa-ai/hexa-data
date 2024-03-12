import BaseModel from "./BaseModel";
import UserModel from "./UserModel";


class ProjectModel extends BaseModel {
  public id: number = 0
  public uuid: string =''
  public name: string =''
  public description: string =''
  public readToken: string=''
  public writeToken: string=''
  public tokenIssuance: string=''
  public tokenExpiry: string=''
  public persistentReadToken: string=''
  public persistentWriteToken: string=''
  public persistentTokenIssuance: string=''
  public persistentTokenExpiry: string=''
  public grafanaEnabled: boolean = false
  public grafanaUrl: string =''
  public grafanaVersion: string =''
  public grafanaDockerHost: string =''
  public grafanaDockerPort: string =''
  public grafanaConfiguration: string =''
  public grafanaReaderPassword: string =''
  public grafanaWriterPassword: string =''
  public nodeRedEnabled: boolean = false
  public nodeRedUrl: string =''
  public nodeRedVersion: string =''
  public nodeRedDockerHost: string =''
  public nodeRedDockerPort: string =''
  public nodeRedConfiguration: string =''
  public nodeRedWriterPassword: string =''

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
