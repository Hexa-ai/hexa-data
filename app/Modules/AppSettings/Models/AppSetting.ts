import { DateTime } from 'luxon'
import { BaseModel, column} from '@ioc:Adonis/Lucid/Orm'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'

export default class AppSetting extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public appTitle: string

  @column()
  public appSubTitle1: string

  @column()
  public appSubTitle2: string

  @column()
  public appSubTitle3: string

  @attachment({ folder: 'appFiles', preComputeUrl: true })
  public appIcon:AttachmentContract | null

  @attachment({ folder: 'appFiles', preComputeUrl: true })
  public appLoginBackground:AttachmentContract | null

  @column()
  public appCompanyName: string

  @column()
  public appCompanyAdress: string

  @column()
  public appCompanyWebsite: string

  @column()
  public appCompanyEmail: string

  @column()
  public appCompanyPhoneNumber: string

  @column()
  public appDefaultLanguage: string

  @column()
  public appMenuBgBodyColor: string

  @column()
  public appMenuBgOverBodyColor: string

  @column()
  public appMenuBgCurrentBodyColor: string

  @column()
  public appMenuFontBodyColor: string

  @column()
  public appMenuFontOverBodyColor: string

  @column()
  public appMenuBgHeaderColor: string

  @column()
  public appMenuFontHeaderColor: string

  @column()
  public appPrimaryColor: string

  @column()
  public appPrimaryOverColor: string

  @column()
  public appPrimaryFocusRingColor: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ autoCreate: true })
  public hdWsMacroLastUpdate?: DateTime
}
