import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
  // Authenticated routes
  Route.group(() => {
    Route.resource('projects', 'ProjectsController')

    // User management
    Route.post('projects/:id/invitation', 'ProjectsController.invitation')
    Route.patch('projects/:id/users/:userId', 'ProjectsController.updateUserSettings')
    Route.delete('projects/:id/users/:userId', 'ProjectsController.removeUsers')

    // Import and export
    Route.post('projects/import/:id', 'ProjectsController.import')
    Route.get('projects/export/:id', 'ProjectsController.export')

    // Updating
    Route.post('projects/:id/generatePersistentTokens', 'ProjectsController.generatePersistentTokens')
    Route.post('projects/:id/updateDashboardType', 'ProjectsController.updateDashboardType')
    Route.post('projects/:id/updateVariableType', 'ProjectsController.updateVariableType')

    // Utility routes
    Route.get('projects/:id/grafana/cookies', 'ProjectsController.getGrafanaCookies')
    Route.get('projects/:id/warp10/variables', 'ProjectsController.getWarp10Variables')
    Route.post('projects/:id/warp10/variables/delete', 'ProjectsController.deleteWarp10Variables')
  }).middleware(['auth'])
})
  .prefix('/api/v1')
  .namespace('App/Modules/Projects/Controllers')
