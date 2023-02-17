import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  manyToMany,
  ManyToMany,
  hasMany,
  HasMany,
  HasManyThrough,
  hasManyThrough,
} from '@ioc:Adonis/Lucid/Orm'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import Project from '../../Projects/Models/Project'
import Role from '../../Projects/Contracts/enums/Roles'
import Device from 'App/Modules/Datas/Models/Device'
import Tag from 'App/Modules/Datas/Models/Tag'

export default class User extends BaseModel {
  public serializeExtras = true

  public async hasProjectRights(projectId: number, role?: Role, owner?: boolean): Promise<boolean> {
    const user: User = this
    const isProjectOwner: boolean = (await Project.find(projectId))?.ownerId == user.id
    if (role != undefined) {
      return (
        (
          await user
            .related('projects')
            .query()
            .where('project_id', projectId)
            .wherePivot('role', role)
        ).length != 0 || isProjectOwner
      )
    } else if (owner == true) {
      return isProjectOwner
    } else {
      return (
        (await user.related('projects').query().where('project_id', projectId)).length != 0 ||
        isProjectOwner
      )
    }
  }
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column()
  public number: string | undefined

  @column()
  public tags: string

  @column()
  public lang: string

  @column({ serializeAs: null })
  public password: string

  @attachment({ folder: 'usersPhotos', preComputeUrl: true })
  public photo: AttachmentContract | null

  @column()
  public isActivated: boolean = false

  @column()
  public isAdmin: boolean = false

  @column()
  public rememberMeToken?: string

  @column()
  public maxProjects: number = 0

  @column()
  public maxDevices: number = 0

  @column()
  public maxVariables: number = 0

  @column()
  public maxMacros: number = 0

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => Project)
  public projects: ManyToMany<typeof Project>

  @hasMany(() => Project, {
    foreignKey: 'ownerId',
    localKey: 'id',
  })
  public ownedProjects: HasMany<typeof Project>

  @hasManyThrough([() => Device, () => Project], {
    foreignKey: 'ownerId',
  })
  public ownedDevices: HasManyThrough<typeof Device>

  @hasManyThrough([() => Tag, () => Project], {
    foreignKey: 'ownerId',
  })
  public ownedTags: HasManyThrough<typeof Tag>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
  public async isOwner(projectId: number) {
    const user: User = this
    const project = await Project.find(projectId)

    return user.id === project?.id
  }
  public async countProjects() {
    const user: User = this
    return (await user.related('ownedProjects').query()).length
  }
  public async countDevices() {
    const user: User = this
    return (await user.related('ownedDevices').query()).length
  }
  public async countVariables() {
    const user: User = this
    return (await user.related('ownedTags').query().where('type', 1)).length
  }
  public async countMacros() {
    const user: User = this
    return (await user.related('ownedTags').query().where('type', 3)).length
  }
}
