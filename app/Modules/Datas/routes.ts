import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
  Route.group(() => {
    Route.get('macros/:projectId/:macroName', 'MacrosController.getMacro').namespace('App/Modules/Datas/Controllers')
    Route.post('projects/:writeToken/wsReport/:name', 'DocumentsController.wsReportStore').namespace('App/Modules/Datas/Controllers')
    Route.get('projects/:writeToken/wsReport/', 'DocumentsController.wsReportIndex').namespace('App/Modules/Datas/Controllers')
    Route.delete('projects/:writeToken/wsReport/:id', 'DocumentsController.wsReportDestroy').namespace('App/Modules/Datas/Controllers')
    Route.post('projects/:writeToken/device/:namespace/msgDown', 'DevicesController.wsMsgDown').namespace('App/Modules/Datas/Controllers')
    Route.get('projects/:projectId/dashboards-report/:writeToken/:id', 'DashboardsController.showReport').namespace('App/Modules/Datas/Controllers')
    Route.post('warp10/:projectId/:writeToken/:lang', 'DashboardsController.execReport').namespace('App/Modules/Datas/Controllers')
    Route.post('projects/:writeToken/report-pdf', 'ReportPdfController.wsReportPdf').namespace('App/Modules/Datas/Controllers')
    Route.group(() => {
      Route.get('projects/:projectId/tags/exportCsv', 'TagsController.exportInCsv').namespace('App/Modules/Datas/Controllers')
      Route.post('projects/:projectId/tags/importCsv', 'TagsController.importFromCsv').namespace('App/Modules/Datas/Controllers')
      Route.resource('projects/:projectId/devices', 'DevicesController').namespace('App/Modules/Datas/Controllers')
      Route.resource('projects/:projectId/tags', 'TagsController').namespace('App/Modules/Datas/Controllers')
      Route.resource('projects/:projectId/dashboards', 'DashboardsController').namespace('App/Modules/Datas/Controllers')
      Route.post('warp10/:projectId', 'DashboardsController.exec').namespace('App/Modules/Datas/Controllers')
      Route.post('projects/:projectId/documents', 'DocumentsController.store').namespace('App/Modules/Datas/Controllers')
      Route.get('projects/:projectId/documents', 'DocumentsController.index').namespace('App/Modules/Datas/Controllers')
      Route.delete('projects/:projectId/documents/:id', 'DocumentsController.destroy').namespace('App/Modules/Datas/Controllers')
    }).middleware(['auth'])

    Route.post('mqtt/auth', 'DevicesController.mqttAuth').namespace('App/Modules/Datas/Controllers')
    Route.post('mqtt/acl', 'DevicesController.mqttAcl').namespace('App/Modules/Datas/Controllers')
  }).prefix('/v1')
}).prefix('/api')
