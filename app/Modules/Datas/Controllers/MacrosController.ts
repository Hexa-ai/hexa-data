import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tag from "../Models/Tag"
import Warp10Service from 'App/Services/Warp10Service'

export default class MacrosController {
  /**
   * Get macro content.
   *
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   */
  public async getMacro({params, response}: HttpContextContract) {
    let macroName: string = params.macroName.slice(0, -4)
    let projectId: number = Number(params.projectId)

    let macro = await Tag.query()
      .where('projectId', projectId)
      .andWhere('name',macroName)
      .andWhere('type',3)
      .andWhere('scriptInterval',0)
      .firstOrFail()
    macro.script= Warp10Service.wsReplaceMacroProjectPrefixe(macro.script,projectId)
    return response.type('text/plain; charset=utf-8').send(macro.script)
  }
}
