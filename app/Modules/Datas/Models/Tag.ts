import { DateTime } from 'luxon'
import { BaseModel, column, computed, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Project from '../../Projects/Models/Project'
import Device from '../../Datas/Models/Device'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public descriptionL1: string

  @column()
  public descriptionL2: string

  @column()
  public descriptionL3: string

  @column()
  public unit: string

  @column()
  public type: number // type values -> 1 GTS, 2 GTS for Text traduction, 3 WARPScript, 4 Javascript

  @column()
  public valueType: number // value_type values -> 1 Boolean, 2 -> Integer, 3 -> Float, 4 -> String

  @column()
  public alarm: boolean

  @column()
  public triggerType?: 'rising' | 'falling'

  @column()
  public settings?: string

  @column()
  public minTreshold: number

  @column()
  public maxTreshold: number

  @column()
  public script: string

  @column()
  public scriptOutput: string

  @column()
  public scriptInterval: number

  @column()
  public physicalUnit?: string

  @column.dateTime()
  public scriptLastExec: DateTime

  @column()
  public projectId: number

  @column()
  public deviceId: number

  @belongsTo(() => Project, {
    foreignKey: 'projectId',
  })
  public project: BelongsTo<typeof Project>

  @belongsTo(() => Device, {
    foreignKey: 'deviceId',
  })
  public device: BelongsTo<typeof Device>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public macroUuid:string | null = null
}
