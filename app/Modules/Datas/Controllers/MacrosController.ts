import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tag from "../Models/Tag"

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
    try {
      let macro = await Tag.query()
      .where('projectId', projectId)
      .andWhere('name',macroName)
      .andWhere('type',3)
      .andWhere('scriptInterval',0)
      .first()
      if ((macro!=null)) {
        return response.type('text/plain; charset=utf-8').send(macro.script)
      } else {
        macro = await Tag.query()
        .andWhere('name',macroName)
        .andWhere('type',3)
        .andWhere('scriptInterval',0)
        .firstOrFail()
        return response.type('text/plain; charset=utf-8').send(macro.script)
      }
    } catch {
      return response.status(404)
    }

  }
}
