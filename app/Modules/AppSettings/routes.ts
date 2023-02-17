import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.get('publicAppSettings', 'AppSettingsController.getPublicAppSettings').namespace('App/Modules/AppSettings/Controllers')

    Route.group(() => {
      Route.get('allAppSettings', 'AppSettingsController.getAllAppSettings').namespace('App/Modules/AppSettings/Controllers')
      Route.patch('allAppSettings', 'AppSettingsController.update').namespace('App/Modules/AppSettings/Controllers')
      Route.post('allAppSettings/updateHdWsMacro', 'AppSettingsController.updateHdWsMacro').namespace('App/Modules/AppSettings/Controllers')
    }).middleware(['auth'])
  }).prefix('/v1')
}).prefix('/api')
