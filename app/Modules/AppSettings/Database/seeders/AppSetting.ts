import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import AppSetting from '../../Models/AppSetting'

export default class AppSettingSeeder extends BaseSeeder {
  public async run () {
    await AppSetting.createMany([
      {
        appTitle: 'Hexa-Data',
        appSubTitle1:'Connecter et exploiter tout le potentiel de vos installations',
        appSubTitle2:'Connect and exploit the full potential of your facilities',
        appSubTitle3:'قم بتوصيل واستغلال الإمكانات الكاملة لمنشآتك',
        appIcon:undefined,
        appLoginBackground:undefined,
        appCompanyName:undefined,
        appCompanyAdress:undefined,
        appCompanyWebsite:undefined,
        appCompanyEmail:undefined,
        appCompanyPhoneNumber:undefined,
        appDefaultLanguage:'fr',
        appMenuBgBodyColor:'#1f2937',
        appMenuBgOverBodyColor:'#374151',
        appMenuBgCurrentBodyColor:'#111827',
        appMenuFontBodyColor:'#d1d5db',
        appMenuFontOverBodyColor:'#9ca3af',
        appMenuBgHeaderColor:'#FFFFFF',
        appMenuFontHeaderColor:'#111827',
        appPrimaryColor:'#dc2626',
        appPrimaryOverColor:'#b91c1c',
        appPrimaryFocusRingColor:'#f87171',
      }
    ])
  }
}
