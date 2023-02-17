import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import Project from 'App/Modules/Projects/Models/Project'

export default class Document extends BaseModel {

  public static async preComputeUrls(models: Document | Document[]) {
    if (Array.isArray(models)) {
      await Promise.all(models.map((model) => this.preComputeUrls(model)))
      return
    }
    if (models.file!=null){
      await models.file?.computeUrl()
      models.file!.url = <string>await models.file?.getSignedUrl()
    }

  }

  @column({ isPrimary: true })
  public id: number
  /**
   * 0 = Project Document, 1 = Report
   */
  @column()
  public type: number;

  @column()
  public inProgress: boolean;

  @column()
  public name: string;

  @column()
  public projectId: number;

  @belongsTo(() => Project, {
    foreignKey: 'projectId',
  })
  public project: BelongsTo<typeof Project>;

  @attachment({ folder: 'projectsDocuments', preComputeUrl: false })
  public file: AttachmentContract | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
