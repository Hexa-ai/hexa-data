import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  manyToMany,
  ManyToMany,
  beforeDelete,
  scope,
  HasMany,
  hasMany,
  belongsTo,
  BelongsTo,
} from '@ioc:Adonis/Lucid/Orm'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import User from '../../Users/Models/User'
import Warp10Service from '../../../Services/Warp10Service'
import TagsService from '../../Datas/Services/TagsService'
import Device from '../../Datas/Models/Device'
import Tag from '../../Datas/Models/Tag'

export default class Project extends BaseModel {
  public serializeExtras = true

  public static visibleTo = scope((query, user: User) => {
    if (user.isAdmin) {
      return
    }

    /**
     * Non-admin users can only view their affected projects
     */
    query
      .join('project_user', 'project_user.project_id', '=', 'projects.id')
      .where('project_user.user_id', user.id)
      .select('*')
      .from('projects')
  })

  /**
   * Delete all related GTS at the same time of project
   *
   * @param project Deleted project instance
   */
  @beforeDelete()
  public static async removeGts(project: Project) {
    await project.load('tags')

    for (const tag of project.tags) {
      new TagsService(project!).deleteGts([tag])
    }
  }

  public static async preComputeUrls(models: Project | Project[]) {
    if (Array.isArray(models)) {
      await Promise.all(models.map((model) => this.preComputeUrls(model)))
      return
    }
    if (models.photo != null) {
      await models.photo?.computeUrl()
      models.photo!.url = <string>await models.photo?.getSignedUrl()
    }
  }

  @column({ isPrimary: true })
  public id: number

  @column()
  public uuid: string

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public readToken: string

  @column()
  public writeToken: string

  @column()
  public persistentReadToken: string

  @column()
  public persistentWriteToken: string

  @column.dateTime()
  public persistentTokenExpiry: DateTime

  @column.dateTime()
  public persistentTokenIssuance: DateTime

  @column.dateTime()
  public tokenIssuance: DateTime

  @column.dateTime()
  public tokenExpiry: DateTime

  @column({
    serialize: (value?: Number) => {
      return Boolean(value)
    },
  })
  public grafanaEnabled: boolean

  @column()
  public grafanaMode: string | null

  @column()
  public grafanaUrl: string | null

  @column()
  public grafanaVersion: string | null

  @column()
  public grafanaConfiguration: string | null

  @column()
  public grafanaReaderPassword: string | null

  @column()
  public grafanaWriterPassword: string | null

  @column()
  public grafanaDockerHost: string | null

  @column()
  public grafanaDockerPort: string | null

  @column({
    serialize: (value?: Number) => {
      return Boolean(value)
    },
  })
  public nodeRedEnabled: boolean

  @column()
  public nodeRedMode: string | null

  @column()
  public nodeRedUrl: string | null

  @column()
  public nodeRedVersion: string | null

  @column()
  public nodeRedDockerHost: string | null

  @column()
  public nodeRedDockerPort: string | null

  @column()
  public nodeRedConfiguration: string | null

  @column()
  public nodeRedWriterPassword: string | null

  // 0|null -> no Cmd, 1 -> Import, 2 -> Export, 3 -> Export in progress, 4 -> Archive in progress, 5 -> Export done
  // 10 -> Unarchive in progress, 11 -> Import in progress, 12 -> Import done
  @column()
  public ImportExportCmd: number

  @column()
  public ImportExportParameters: string

  @column({ columnName: 'photo' })
  public photoFileInfo: string

  @column()
  public exportLink: string

  @column.dateTime()
  public exportLinkExpiry: DateTime

  @attachment({ folder: 'projectsPhotos', preComputeUrl: false })
  public photo: AttachmentContract | null

  @manyToMany(() => User, {
    pivotColumns: ['role', 'tags'],
  })
  public users: ManyToMany<typeof User>

  @hasMany(() => Tag)
  public tags: HasMany<typeof Tag>

  @hasMany(() => Device)
  public devices: HasMany<typeof Device>

  @column()
  public ownerId: number

  @belongsTo(() => User, {
    foreignKey: 'ownerId',
    localKey: 'id',
  })
  public owner: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  /**
   * Update all project token for WARP10.
   *
   * @returns bool true
   */
  public static async updateAllTokens() {
    const projects = await Project.query().select(
      'id',
      'uuid',
      'name',
      'readToken',
      'writeToken',
      'tokenIssuance',
      'tokenExpiry'
    )
    for (const project of projects) {
      const warp10Service = new Warp10Service()
      const tokens = await warp10Service.generatePairOfTokens(
        { projectUuid: project.uuid },
        project.uuid
      )

      project.readToken = tokens.readToken
      project.writeToken = tokens.writeToken
      project.tokenIssuance = tokens.issuance
      project.tokenExpiry = tokens.expiry

      await project.save()
    }
    return true
  }

  public static async ownerHasDevicesCredits(projectId: number) {
    const project = await Project.findOrFail(projectId)
    await project.load('owner')
    await project.load('devices')

    return project.devices.length < project.owner.maxDevices
  }
  public static async ownerHasVariablesCredits(projectId: number) {
    const project = await Project.findOrFail(projectId)
    await project.load('owner')
    const variables = await project.related('tags').query().where('type', 1)

    return variables.length < project.owner.maxVariables
  }
  public static async ownerHasMacrosCredits(projectId: number) {
    const project = await Project.findOrFail(projectId)
    await project.load('owner')
    const macros = await project.related('tags').query().where('type', 3)

    return macros.length < project.owner.maxMacros
  }
}
