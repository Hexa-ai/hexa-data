import { DateTime } from "luxon";
import BaseModel from "./BaseModel";


class PublicAppSettings extends BaseModel {
  public id: number = 0
  public appCompanyAdress: string = '6 Rue Jean Marie Chevalier'
  public appCompanyEmail: string = 'contact@hexa-ai.fr'
  public appCompanyName: string = 'Hexa-AI'
  public appCompanyPhoneNumber: string = '06 66 74 04 58'
  public appCompanyWebsite: string = 'www.hexa-ai.fr'
  public appDefaultLanguage: string = 'fr'
  public appIcon: any = null
  public appLoginBackground: any = null
  public appSubTitle1: string = 'Connecter et exploiter tout le potentiel de vos installations'
  public appSubTitle2: string = 'Connect and exploit the full potential of your facilities'
  public appSubTitle3: string = 'قم بتوصيل واستغلال الإمكانات الكاملة لمنشآتك'
  public appMenuBgBodyColor: string = '#1f2937'
  public appMenuBgOverBodyColor: string = '#374151'
  public appMenuBgCurrentBodyColor: string = '#111827'
  public appMenuFontBodyColor: string = '#d1d5db'
  public appMenuFontOverBodyColor: string = '#9ca3af'
  public appMenuBgHeaderColor: string = '#FFFFFF'
  public appMenuFontHeaderColor: string = '#111827'
  public appPrimaryColor: string = '#dc2626'
  public appPrimaryOverColor: string = '#b91c1c'
  public appPrimaryFocusRingColor: string = '#f87171'
  public appTitle: string = 'Hexa-Data'
  public appVersion: string = '0.0.0'
  public isLicenseActivated = false
  public isServerInstance = false
}


export default PublicAppSettings
