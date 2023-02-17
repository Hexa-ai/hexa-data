import Project from "../Models/Project"
import Device from "../../Datas/Models/Device"
import Tag from "../../Datas/Models/Tag"
import Dashboard from "../../Datas/Models/Dashboard"
import { string } from '@ioc:Adonis/Core/Helpers'
import Logger from '@ioc:Adonis/Core/Logger'
import Drive from '@ioc:Adonis/Core/Drive'

export default class ExportConfService {
  private _devices: Device[]
  private _tags: Tag[]
  private _dashboards: Dashboard[]
  private _project:Project

  set project(value:Project) {
    this._project=value
  }
  get project(): Project{
    return this._project
  }

  public get devices(): Device[] {
    return this._devices
  }
  public set devices(value: Device[]) {
    this._devices = value
  }

  public get tags(): Tag[] {
    return this._tags
  }
  public set tags(value: Tag[]) {
    this._tags = value
  }

  public get dashboards(): Dashboard[] {
    return this._dashboards
  }
  public set dashboards(value: Dashboard[]) {
    this._dashboards = value
  }

  /**
   *
   * Initialise models to export (devices, tags and dashboards)
   *
   * @param projectId number
   *
   */
  private async init(projectId:number) {
    this.project = await Project.query().where('id', projectId).firstOrFail()
    this.devices = await Device.query().where('projectId', this.project.id).pojo()
    this.tags = await Tag.query().where('projectId', this.project.id).pojo()
    this.dashboards = await Dashboard.query().where('projectId', this.project.id).pojo()
    Logger.info(' * Data to export loaded')

  }

  /**
   *
   * Stringify exported models in one JSON object
   *
   */
  private async formatExport():Promise<string> {
    return JSON.stringify({project: this.project, devices: this.devices, tags: this.tags, dashboards:this.dashboards })
    Logger.info(' * Data to export formated')
  }

  /**
   *
   * Save exported datas to Drive storage
   *
   * @param formatedExport
   *
   */
  private async save(formatedExport:string):Promise<void>{
    await Drive.put('export/' +  string.camelCase(this.project.name) + '.json', formatedExport)
    this.project.ImportExportCmd=1
    await this.project.save()
    Logger.info(' * Data to export saved')
  }

  /**
   *
   * Export project conf to Drive storage
   *
   * @param projectId
   *
   */
  public async export(projectId:number):Promise<void>{
    await this.init(projectId)
    const data = await this.formatExport()
    await this.save(data)
  }
}
