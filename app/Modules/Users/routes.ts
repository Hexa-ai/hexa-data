import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
  Route.group(() => {
    Route.post('register', 'AuthController.register').namespace('App/Modules/Users/Controllers')
    Route.post('login', 'AuthController.login').namespace('App/Modules/Users/Controllers')
    Route.post('forgot-password', 'UsersController.forgotPassword').namespace('App/Modules/Users/Controllers')
    Route.group(() => {
      Route.resource('users', 'UsersController').namespace('App/Modules/Users/Controllers')
    }).middleware(['auth'])
  }).prefix('/v1')
}).prefix('/api')
