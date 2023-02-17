import { DateTime } from 'luxon';
import Hash from '@ioc:Adonis/Core/Hash';
import { BaseModel, column, beforeSave, beforeDelete, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm';
import Project from '../../Projects/Models/Project';
import TagsService from '../Services/TagsService'
import Tag from '../../Datas/Models/Tag'

export default class Device extends BaseModel {
  /**
   * Delete all related GTS at the same time of device
   *
   * @param project Deleted project instance
   */
  @beforeDelete()
  public static async removeGts(device: Device) {

    await device.load('tags')
    await device.load('project')
    const project = device.project

    for (const tag of device.tags) {
      await new TagsService(project!).deleteGts([tag])
    }

  }
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public namespace: string;

  @column()
  public description: string;

  @column()
  public adress: string;

  @column()
  public long: number;

  @column()
  public lat: number;

  @column()
  public clientId: string;

  @column()
  public username: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public dashboardId?: number;

  @column()
  public projectId: number;

  @hasMany(() => Tag)
  public tags: HasMany<typeof Tag>

  @belongsTo(() => Project, {
   foreignKey: 'projectId',
  })
  public project: BelongsTo<typeof Project>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword(device: Device) {
    if (device.$dirty.password) {
      device.password = await Hash.make(device.password);
    }
  }

  /**
   * Find device with its ClientId.
   *
   * @param clientId string
   */
  public static async getByClientId(clientId: string) {
    return await Device.query().where('clientId', clientId).first()
  }
}
