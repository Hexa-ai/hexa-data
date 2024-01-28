import { reactive } from 'vue'
import ProjectInfoModel from '../Models/ProjectInfoModel'
import UserModel from '../Models/UserModel'
import PublicAppSettings from './../Models/PublicAppSettings'

class Store {
  constructor() {
    this.publicAppSettings = <PublicAppSettings>reactive(new PublicAppSettings())
    this.authUser = <UserModel>reactive(new UserModel())
    this.currentProject = <ProjectInfoModel>reactive(new ProjectInfoModel())
  }

  public publicAppSettings: PublicAppSettings
  public authUser: UserModel
  public currentProject: ProjectInfoModel
  public showSideBarDesktop: boolean = true
  public memoDateRange: [string, string] = ['', '']
}
export default Store
