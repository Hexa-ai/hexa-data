import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import AppSetting from '../Models/AppSetting'
import UpdateUserValidator from '../Validators/UpdateAppSettingValidator'
import axios from 'axios'
import { DateTime } from 'luxon'
import Env from '@ioc:Adonis/Core/Env'
import fs from 'fs'

export default class AppSettingsController {
  /**
   * Show public app settings
   * GET publicAppSettings
   *
   * @param {response} ResponseContract
   */
  public async getPublicAppSettings({ response }: HttpContextContract) {
    const settings = await AppSetting.firstOrFail()
    const publicSettings = settings.serialize({
      fields: {
        omit: [],
      },
    })
    const data = fs.readFileSync('package.json')
    const packageJson = JSON.parse(data.toString())
    publicSettings.appVersion = packageJson.version
    response.send(publicSettings)
  }
  /**
   * Show all app settings
   * GET allAppSettings
   *
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async getAllAppSettings({ response, bouncer }: HttpContextContract) {
    await bouncer.with('AppSettingPolicy').authorize('getAllAppSettings')
    const settings = await AppSetting.firstOrFail()

    response.send(settings)
  }
  /**
   * Update app settings.
   * PATCH allAppSettings
   *
   * @param {request} RequestContract
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async update({ request, response, bouncer }: HttpContextContract) {
    await bouncer.with('AppSettingPolicy').authorize('update')
    const appIcon = request.file('appIcon')!
    const appLoginBackground = request.file('appLoginBackground')!

    const settings = await AppSetting.firstOrFail()
    const payload = await request.validate(UpdateUserValidator)

    settings.appTitle = payload.appTitle!
    settings.appSubTitle1 = payload.appSubTitle1!
    settings.appSubTitle2 = payload.appSubTitle2!
    settings.appSubTitle3 = payload.appSubTitle3!
    settings.appCompanyName = payload.appCompanyName!
    settings.appCompanyAdress = payload.appCompanyAdress!
    settings.appCompanyWebsite = payload.appCompanyWebsite!
    settings.appCompanyEmail = payload.appCompanyEmail!
    settings.appCompanyPhoneNumber = payload.appCompanyPhoneNumber!
    settings.appDefaultLanguage = payload.appDefaultLanguage!

    settings.appMenuBgBodyColor  = payload.appMenuBgBodyColor!
    settings.appMenuBgOverBodyColor = payload.appMenuBgOverBodyColor!
    settings.appMenuBgCurrentBodyColor = payload.appMenuBgCurrentBodyColor!
    settings.appMenuFontBodyColor  = payload.appMenuFontBodyColor!
    settings.appMenuFontOverBodyColor = payload.appMenuFontOverBodyColor!
    settings.appMenuBgHeaderColor = payload.appMenuBgHeaderColor!
    settings.appMenuFontHeaderColor = payload.appMenuFontHeaderColor!
    settings.appPrimaryColor = payload.appPrimaryColor!
    settings.appPrimaryOverColor = payload.appPrimaryOverColor!
    settings.appPrimaryFocusRingColor = payload.appPrimaryFocusRingColor!

    if (appIcon != null) {
      settings.appIcon = Attachment.fromFile(appIcon)
    }
    if (appLoginBackground != null) {
      settings.appLoginBackground = Attachment.fromFile(appLoginBackground)
    }

    await settings.save()

    response.send(settings)
  }
  /**
   * Update hd-warpscript-macros macros with warpFleetSynchronizer.
   * PATCH updateHdWsMacro
   *
   * @param {response} ResponseContract
   * @param {Bouncer} ActionsAuthorizerContract<User>
   */
  public async updateHdWsMacro({ response, bouncer }: HttpContextContract) {
    await bouncer.with('AppSettingPolicy').authorize('update')
    const result = await axios.post(Env.get('WARPFLEET_SYNCHRONISER_URL_PREFIX') + '/hd-warpscript-macros')

    if(result.status==200){
      const settings = await AppSetting.firstOrFail()
      settings.hdWsMacroLastUpdate = DateTime.now()
      await settings.save()
      response.send(settings)
    }
    response.status(503)
  }
}
