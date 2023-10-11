import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
  Route.group(() => {
    // Used for backend warpscript execution
    Route.post('projects/:writeToken/jsExec/:name', 'MacrosController.jsExec').namespace('App/Modules/Datas/Controllers')
    // Used by macro to generate txt or csv report (index, store or delete)
    Route.post('projects/:writeToken/wsReport/:name', 'DocumentsController.wsReportStore').namespace('App/Modules/Datas/Controllers')
    Route.get('projects/:writeToken/wsReport/', 'DocumentsController.wsReportIndex').namespace('App/Modules/Datas/Controllers')
    Route.delete('projects/:writeToken/wsReport/:id', 'DocumentsController.wsReportDestroy').namespace('App/Modules/Datas/Controllers')
    // Used to send MQTT message to device (on HB/clientId/down topic )
    Route.post('projects/:writeToken/device/:namespace/msgDown', 'DevicesController.wsMsgDown').namespace('App/Modules/Datas/Controllers')
    // Used for pdf report generation
    Route.get('projects/:projectId/dashboards-report/:writeToken/:id', 'DashboardsController.showReport').namespace('App/Modules/Datas/Controllers')
    Route.post('warp10/:projectId/:writeToken/:lang', 'DashboardsController.execReport').namespace('App/Modules/Datas/Controllers')
    Route.post('projects/:writeToken/report-pdf', 'ReportPdfController.wsReportPdf').namespace('App/Modules/Datas/Controllers')

  }).prefix('/v1')
  Route.group(() => {
    // Used by Warpfleet Warp10 extension to obtain hexa-data project macros
    Route.get('macros/:projectId/:macroName', 'MacrosController.getMacro').namespace('App/Modules/Datas/Controllers')
    // Used by MQTT broker for client auth
    Route.post('mqtt/auth', 'DevicesController.mqttAuth').namespace('App/Modules/Datas/Controllers')
    Route.post('mqtt/acl', 'DevicesController.mqttAcl').namespace('App/Modules/Datas/Controllers')
  }).prefix('/v1')
  Route.group(() => {
    Route.get('projects/:projectId/tags/exportCsv', 'TagsController.exportInCsv').namespace('App/Modules/Datas/Controllers')
    Route.post('projects/:projectId/tags/importCsv', 'TagsController.importFromCsv').namespace('App/Modules/Datas/Controllers')
    Route.resource('projects/:projectId/devices', 'DevicesController').namespace('App/Modules/Datas/Controllers')
    Route.resource('projects/:projectId/tags', 'TagsController').namespace('App/Modules/Datas/Controllers')
    Route.resource('projects/:projectId/dashboards', 'DashboardsController').namespace('App/Modules/Datas/Controllers')
    Route.post('warp10/:projectId', 'DashboardsController.exec').namespace('App/Modules/Datas/Controllers')
    Route.post('projects/:projectId/jsExec/:macroId/play', 'MacrosController.jsPlay').namespace('App/Modules/Datas/Controllers')
    Route.post('projects/:projectId/jsExec/:macroId/stop', 'MacrosController.jsStop').namespace('App/Modules/Datas/Controllers')
    //Route.post('projects/:projectId/wsExec/:macroId', 'MacrosController.wsExec').namespace('App/Modules/Datas/Controllers')
    //Route.post('warp10/:projectId', 'MacrosController.wsExec').namespace('App/Modules/Datas/Controllers')
    Route.post('projects/:projectId/documents', 'DocumentsController.store').namespace('App/Modules/Datas/Controllers')
    Route.get('projects/:projectId/documents', 'DocumentsController.index').namespace('App/Modules/Datas/Controllers')
    Route.delete('projects/:projectId/documents/:id', 'DocumentsController.destroy').namespace('App/Modules/Datas/Controllers')
  }).prefix('/v1').middleware(['auth'])
}).prefix('/api')
