import Route from '@ioc:Adonis/Core/Route'
import Env from '@ioc:Adonis/Core/Env'
import path from 'path'
import loadAssets from 'App/Utils/loadAssets'

const isDevEnv = Env.get('NODE_ENV') === 'development'

import 'App/Modules/AppSettings/routes'
import 'App/Modules/Datas/routes'
import 'App/Modules/Projects/routes'
import 'App/Modules/Users/routes'
import 'App/Modules/Notify/routes'

// Serve vite resources on dev mode
if (isDevEnv) {
  Route.get('/src/*', async ({ request, response }) => {
    const file = path.resolve(`./ui/${request.url()}`)
    response.attachment(file, path.basename(file), 'inline')
  })
}
Route.get('*', async ({ view }) => {
  const assetsData = await loadAssets()
  return view.render('index', {
    isDev: !assetsData.found && isDevEnv,
    assetsData,
  })
})
