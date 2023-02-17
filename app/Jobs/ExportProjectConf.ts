import ExportConfService from 'App/Modules/Projects/Services/ExportConfService'

export default class ExportProjectConf {
  public async handle(payload: number) {
    const exportConf = new ExportConfService();
    exportConf.export(payload)
  }
}
