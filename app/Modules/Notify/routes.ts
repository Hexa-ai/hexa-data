import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
  Route.group(() => {
    Route.group(() => {
      Route.post('notify/:writeToken/mail', 'NotifyController.wsSendEmail').namespace('App/Modules/Notify/Controllers')
      Route.post('notify/:writeToken/mail/tag', 'NotifyController.wsSendEmailToTag').namespace('App/Modules/Notify/Controllers')
      Route.post('notify/:writeToken/sms', 'NotifyController.wsSendSms').namespace('App/Modules/Notify/Controllers')
      Route.post('notify/:writeToken/sms/tag', 'NotifyController.wsSendSmsToTag').namespace('App/Modules/Notify/Controllers')
    })
  }).prefix('/v1')
}).prefix('/api')
