import BaseModel from "./BaseModel";
import RoleType from "../Contracts/RoleType";


class UserModel extends BaseModel {
  id: number = 0
  email: string = ''
  isActivated: number = 0
  isAdmin: number = 0
  lang: string = ''
  meta: any = null
  name: string = ''
  photo: any = null
  rememberMeToken: string = ''
  token: any = ''
  projectRole?: number = 0
  password?: string
  number: string = ''
  projectTags?: string = ''
  createdAt: string = ''
  maxProjects: number = 0
  maxDevices: number = 0
  maxVariables: number = 0
  maxMacros: number = 0
}

export default UserModel
