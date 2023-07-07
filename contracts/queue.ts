declare module '@ioc:Rlanz/Queue' {
  interface JobsList {
    'App/Jobs/ExportProjectConf': number
    'App/Jobs/ImportProjectConf': number
    'App/Jobs/SendNotifMail': any
    'App/Jobs/SendNotifMailAdminNewUser': any
    'App/Jobs/SendNotifMailAdminUserAddedProject': any
    'App/Jobs/SendNotifMailAttchProj': any
    'App/Jobs/SendNotifMailPswd': any
    'App/Jobs/SendNotifMailToTag': any
    'App/Jobs/SendNotifMailWelcome': any
    'App/Jobs/SendNotifSms': any
    'App/Jobs/SendNotifSmsToTag': any
  }
}
