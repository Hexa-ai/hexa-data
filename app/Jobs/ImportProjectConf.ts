import ImportConfService from 'App/Modules/Projects/Services/ImportConfService';

export default class ImportProjectConf {
  public async handle(payload: number) {
    const importConf = new ImportConfService();
    importConf.import(payload)
  }
}
