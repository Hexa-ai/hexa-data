import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
  Route.group(() => {
    Route.group(() => {
      Route.resource('projects', 'ProjectsController').namespace('App/Modules/Projects/Controllers')
      Route.post('projects/import/:id', 'ProjectsController.import').namespace(
        'App/Modules/Projects/Controllers'
      )
      Route.post('projects/:id/invitation', 'ProjectsController.invitation').namespace(
        'App/Modules/Projects/Controllers'
      )
      Route.patch('projects/:id/users/:userId', 'ProjectsController.updateUserSettings').namespace(
        'App/Modules/Projects/Controllers'
      )
      Route.get('projects/export/:id', 'ProjectsController.export').namespace(
        'App/Modules/Projects/Controllers'
      )
      Route.delete('projects/:id/users/:userId', 'ProjectsController.removeUsers').namespace(
        'App/Modules/Projects/Controllers'
      )
      Route.post('projects/:id/generatePersistentTokens', 'ProjectsController.generatePersistentTokens').namespace(
        'App/Modules/Projects/Controllers'
      )
    }).middleware(['auth'])
  }).prefix('/v1')
}).prefix('/api')
