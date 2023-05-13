import Drive from '@ioc:Adonis/Core/Drive'
import CsvService from '../Services/CsvService'
import { I_Log, OpLoggerService } from './OpLoggerService'
import { validator } from '@ioc:Adonis/Core/Validator'
import UpdateTagValidator from '../Validators/UpdateTagValidator'
import StoreTagValidator from '../Validators/StoreTagValidator'
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import Project from '../../Projects/Models/Project'
import Warp10Service from '../../../Services/Warp10Service'
import { WarpGts } from '../../../Services/Warp10Service'
import Tag from '../Models/Tag'
import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Modules/Users/Models/User'
interface ValidatedData {
  datas:{}[]
  errors:I_Log[]
  errorsNumber:number
}
export default class TagsService {
  constructor(project: Project) {
    this.project = project
    this.warp10Service = new Warp10Service()
  }

  private project : Project

  private warp10Service: Warp10Service

  public async importFromCsv(file: MultipartFileContract, bouncer: ActionsAuthorizerContract<User>): Promise<ValidatedData> {
    await file.moveToDisk('./tmp')
    const fileContent = await Drive.get('./tmp/' + file.fileName)
    Drive.delete('./tmp/' + file.fileName)
    const datas = CsvService.fromCsv(fileContent.toString('utf8'))
    this.validateProjectLimitations(datas, bouncer)
    const preparedDatas = await this.forceProjectId(datas)
    const validatedDatas = await this.validate(preparedDatas)

    return validatedDatas
  }
  public async forceProjectId(datas: {}[]): Promise<object[]> {
    const newDatas:{}[] =[]
    for (let data of datas) {
      data['projectId']=this.project.id.toString()
      newDatas.push(data)
    }
    return newDatas
  }
  public async validateProjectLimitations(datas: {}[], bouncer: ActionsAuthorizerContract<User>){
    for (const data of datas) {
      await bouncer.with('TagPolicy').authorize('store',this.project.id,data['type'])
    }

  }
  public async validate(datas: {}[]): Promise<ValidatedData> {
    let validatedDatas: {}[] = []
    const importLogs = new OpLoggerService
    for (let data of datas) {
      if (data['id'] != '') {
        try {
          const updatePayload = await validator.validate({ schema: UpdateTagValidator.buildSchema(data['id']), data: data })
          updatePayload.projectId=this.project.id
          validatedDatas.push(updatePayload)
        } catch (error) {
          importLogs.append(['update', JSON.stringify(error.messages), JSON.stringify(data)])
        }
      } else {
        try {
          const storePayload = await validator.validate({ schema: StoreTagValidator.buildSchema(data['projectId']), data: data })
          storePayload.projectId=this.project.id
          validatedDatas.push(storePayload)
        } catch (error) {
          importLogs.append(['create', JSON.stringify(error.messages), JSON.stringify(data)])
        }
      }
    }
    return { datas: validatedDatas, errors: importLogs.getLogs(), errorsNumber: importLogs.getLogs().length }
  }
  public async deleteGts(tags: Tag[]) {

    const gtsCollection:WarpGts[] = []

    for (const tag of tags) {
      if (tag.type==1){
        await tag.load('device')
        gtsCollection.push({
          classname:tag.device.namespace + '.' + tag.name,
          labels:{ ...{projectUuid:this.project.uuid},...{physicalUnit:tag.physicalUnit}, ...await this.generateLabels(tag.name) },
          attributes: {
            descriptionL1:tag.descriptionL1,
            descriptionL2:tag.descriptionL2,
            descriptionL3:tag.descriptionL3,
            unit:tag.unit,
            alarm:tag.alarm,
            minTreshold:tag.minTreshold,
            maxTreshold:tag.maxTreshold
          },
          valueType: tag.valueType
        })
      }
    }
    const result = await this.warp10Service.deleteGts(gtsCollection, this.project.readToken, this.project.writeToken)
    return JSON.stringify(result)
  }
  public async generateLabels(gtsName:string) {
    let labels={}
    const labelsValues = gtsName.split('.')

    for ( const i in labelsValues ) {
      labels['l-'+i]=labelsValues[i]
    }
    if (Object.keys(labels).length>1){
      return labels
    } else {
      return {}
    }
  }
  public async createGts(tags: Tag[]) {
    const gtsCollection:WarpGts[] = []

    for (const tag of tags) {
      if (tag.type==1){
        await tag.load('device')
        gtsCollection.push({
          classname:tag.device.namespace + '.' + tag.name,
          labels:{ ...{projectUuid:this.project.uuid},...{physicalUnit:tag.physicalUnit}, ...await this.generateLabels(tag.name) },
          attributes: {
            descriptionL1:tag.descriptionL1,
            descriptionL2:tag.descriptionL2,
            descriptionL3:tag.descriptionL3,
            unit:tag.unit,
            alarm:String(tag.alarm),
            minTreshold:String(tag.minTreshold),
            maxTreshold:String(tag.maxTreshold)
          },
          valueType: tag.valueType
        })
      }

    }
    const result = await this.warp10Service.createGts(gtsCollection, this.project.readToken, this.project.writeToken)
    return JSON.stringify(result)
  }
  public classnameToTagname(classname:string):string{
    const devicePrefix = classname.split('.')[0] + '.'
    return classname.split(devicePrefix)[1]
  }

}
