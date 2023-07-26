import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tag from "../Models/Tag"
import Warp10Service from 'App/Services/Warp10Service'
import Project from 'App/Modules/Projects/Models/Project'
import runtimeManager from '@ioc:JsRuntime/RuntimeManager'
import Redis from '@ioc:Adonis/Addons/Redis'

export default class MacrosController {
  /**
   * Get macro content.
   *
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   */
  public async getMacro({ params, response }: HttpContextContract) {
    let macroName: string = params.macroName.slice(0, -4)
    let projectId: number = Number(params.projectId)

    let macro = await Tag.query()
      .where('projectId', projectId)
      .andWhere('name', macroName)
      .andWhere('type', 3)
      .andWhere('scriptInterval', 0)
      .firstOrFail()
    macro.script = Warp10Service.wsReplaceMacroProjectPrefixe(macro.script, projectId)
    return response.type('text/plain; charset=utf-8').send(macro.script)
  }
  /**
   * Start javascript programme.
   * POST javascript/:projectId/:MacroId/play
   *
   * @param {params} Record<string, any>
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async jsPlay({ params, response, bouncer, auth }: HttpContextContract) {
    await bouncer.with('TagPolicy').authorize('store', params.projectId, 4)
    const project = await Project.findOrFail(params.projectId)
    const macro = await Tag.query().where('projectId', project.id).andWhere('id', params.macroId).firstOrFail()

    let description: string = ''
    if (auth.user != undefined) {
      if (auth.user.lang == project.l1) {
        description = 'descriptionL1'
      } else if (auth.user.lang == project.l2) {
        description = 'descriptionL2'
      } else if (auth.user.lang == project.l3) {
        description = 'descriptionL3'
      } else {
        description = 'descriptionL1'
      }
    }

    runtimeManager.startMacro(project.id, project.readToken, project.writeToken, macro.name, macro.id, macro.script,{description:description})

    response.send('ok')
  }
 /**
  * Stop javascript programme.
  * POST javascript/:projectId/:MacroId/play
  *
  * @param {params} Record<string, any>
  * @param {response} ResponseContract
  * @param {Bouncer} ActionsAuthorizerContract<User>
  */
  public async jsStop({ params, response, bouncer }: HttpContextContract) {
    await bouncer.with('TagPolicy').authorize('store', params.projectId, 4)
    const project = await Project.findOrFail(params.projectId)
    const macro = await Tag.query().where('projectId', project.id).andWhere('id', params.macroId).firstOrFail()
    const uuid = await Redis.get('macro-' + macro.id.toString())

    runtimeManager.stopMacro(uuid!)

    response.send('ok')
  }
  /**
  * Exec javascript function from warpScript.
  * POST projects/:writeToken/jsExec
  *
  * @param {params} Record<string, any>
  * @param {request} RequestContract
  * @param {response} ResponseContract
  */
  public async jsExec({ params, request, response }: HttpContextContract) {
    const project = await Project.query().where('writeToken', params.writeToken).firstOrFail()
    const payload = JSON.parse(request.raw()!)
    const macro = await Tag.query().where('projectId', project.id).andWhere('name', params.name ).firstOrFail()

    const result = await runtimeManager.exec(project.id, project.readToken, project.writeToken, macro.name, macro.id, macro.script,payload)

    response.send(result)
  }


}
