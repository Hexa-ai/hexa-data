import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import RegisterAuthValidator from '../Validators/RegisterAuthValidator'
import LoginValidator from '../Validators/LoginAuthValidator'
import User from '../Models/User'
import Event from '@ioc:Adonis/Core/Event'

export default class AuthController {
  /**
   * Register new user.
   * POST users/register
   *
   * @param {request} RequestContract
   * @param {response} ResponseContract
   */
  public async register({ request, response }: HttpContextContract) {
    const payload = await request.validate(RegisterAuthValidator)

    const newUser = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
    }

    const user = await User.create(newUser)
    Event.emit('new:user', user)

    return response.created(user) // 201 CREATED
  }
  /**
   * Login user if activated.
   * POST users/login
   *
   * @param {auth} AuthContract
   * @param {request} RequestContract
   * @param {response} ResponseContract
   */
  public async login({ auth, request, response }: HttpContextContract) {
    const { email, password } = await request.validate(LoginValidator)

    // Lookup user manually
    const user = await User.query().where('email', email).first()
    if (user==undefined) {
      return response.abort('Not authenticated', 401)
    }
    console.log(user.isActivated)
    // Check if account activated
    if (user.isActivated == false) {
      return response.abort('Account not activated',401)
    }

    // Verify password
    if (!(await Hash.verify(user.password, password))) {
      return response.abort('Not authenticated', 401)
    }

    // Generate token
    const token = await auth.use('api').generate(user)

    return response.ok({
      token: token,
      ...user.serialize(),
    })
  }
}
