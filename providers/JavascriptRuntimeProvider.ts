import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready when this file is loaded by the framework.
| Hence, the top level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
| @example:
|
| public async ready () {
|   const Database = this.app.container.resolveBinding('Adonis/Lucid/Database')
|   const Event = this.app.container.resolveBinding('Adonis/Core/Event')
|   Event.on('db:query', Database.prettyPrint)
| }
|
*/
export default class JavascriptRuntimeProvider {
  constructor(protected app: ApplicationContract) { }

  public register() {
    // Register your own bindings
    this.app.container.singleton('JsRuntime/RuntimeManager', () => {
      const JsRuntimeMgmtService = require('./../app/Services/JsRuntime/JsRuntimeMgmtService').default
      return new JsRuntimeMgmtService()
    })
  }

  public async boot() {
    // All bindings are ready, feel free to use them
    const  runtimeManager =this.app.container.use('JsRuntime/RuntimeManager')
    runtimeManager.init()

  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
