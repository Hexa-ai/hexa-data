import { DateTime } from "luxon";
import BaseModel from "./BaseModel";
import PublicAppSettings from "./PublicAppSettings";


class AppSettings extends PublicAppSettings {
  public hdWsMacroLastUpdate:string=''
}

export default AppSettings
