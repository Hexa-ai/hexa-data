import { DateTime } from 'luxon'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Project from '../../Projects/Models/Project'

export default class Dashboard extends BaseModel {

  public static async preComputeUrls(models: Dashboard | Dashboard[]) {
    if (Array.isArray(models)) {
      await Promise.all(models.map((model) => this.preComputeUrls(model)))
      return
    }
    if (models.imgBg!=null){
      await models.imgBg?.computeUrl()
      models.imgBg!.url = <string>await models.imgBg?.getSignedUrl()
    }
  }

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
  public body: string

  @column()
  public stared: boolean

  @column()
  public projectId: number

  @column()
  public type: string


  @attachment({ folder: 'projectsPhotos', preComputeUrl: false })
  public imgBg: AttachmentContract | null

  @column()
  public enableImgBg: boolean

  @column()
  public colorBg: string

  @belongsTo(() => Project, {
    foreignKey: 'projectId',
   })
   public project: BelongsTo<typeof Project>;


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
