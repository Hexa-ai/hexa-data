import { ref } from "vue"
import RoleType from "../Contracts/RoleType"
import ProjectInfoModel from "../Models/ProjectInfoModel"
import UserModel from "../Models/UserModel"
import store from "../store"
import { BaseController } from "./BaseController"

class RouteService {
  public static async getProjectInfos(route:any):Promise<ProjectInfoModel> {
    const refProjectInfo = ref(new ProjectInfoModel())
    const projectCrudController = new BaseController<ProjectInfoModel>(
      '/projects',
      [{ name: 'photo' }],
      refProjectInfo.value,
      store.authUser.token['token'],
    )
    refProjectInfo.value = await projectCrudController.show(Number(route.params.id))
    store.currentProject=refProjectInfo.value
    for (const user of refProjectInfo.value.users) {
      if (user.id == store.authUser.id){
        store.authUser.projectRole = user.meta.pivot_role
        store.authUser.projectTags = user.meta.pivot_tags
      }
    }
    return refProjectInfo.value
  }
}

export { RouteService }
