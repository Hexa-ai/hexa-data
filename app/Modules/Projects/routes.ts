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
    Route.post(
      'projects/:id/generatePersistentTokens',
      'ProjectsController.generatePersistentTokens'
    )

    // Utility routes
    Route.get('projects/:id/warp10/variables', 'ProjectsController.getWarp10Variables')
    Route.post('projects/:id/warp10/variables/delete', 'ProjectsController.deleteWarp10Variables')

    // Grafana Service
    Route.get('projects/services/grafana/config', 'ServiceGrafanaController.getDefaultConfig')

    Route.post('projects/:id/services/grafana', 'ServiceGrafanaController.update')
    Route.get('projects/:id/services/grafana/cookies', 'ServiceGrafanaController.getAuthCookies')
    Route.get('projects/:id/services/grafana/status', 'ServiceGrafanaController.getStatus')
    Route.post('projects/:id/services/grafana/stop', 'ServiceGrafanaController.stop')
    Route.post('projects/:id/services/grafana/start', 'ServiceGrafanaController.start')
    Route.post('projects/:id/services/grafana/restart', 'ServiceGrafanaController.restart')
    Route.post('projects/:id/services/grafana/exec', 'ServiceGrafanaController.execCommand')

    // NodeRed Service
    Route.get('projects/services/node-red/config', 'ServiceNodeRedController.getDefaultConfig')

    Route.post('projects/:id/services/node-red', 'ServiceNodeRedController.update')
    Route.get('projects/:id/services/node-red/cookies', 'ServiceNodeRedController.getAuthCookies')
    Route.get('projects/:id/services/node-red/status', 'ServiceNodeRedController.getStatus')
    Route.post('projects/:id/services/node-red/stop', 'ServiceNodeRedController.stop')
    Route.post('projects/:id/services/node-red/start', 'ServiceNodeRedController.start')
    Route.post('projects/:id/services/node-red/restart', 'ServiceNodeRedController.restart')
    Route.post('projects/:id/services/node-red/exec', 'ServiceNodeRedController.execCommand')
  }).middleware(['auth'])
})
  .prefix('/api/v1')
  .namespace('App/Modules/Projects/Controllers')
