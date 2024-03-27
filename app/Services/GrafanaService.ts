import Env from '@ioc:Adonis/Core/Env'
import axios, { AxiosRequestHeaders } from 'axios'
import https from 'https'

export default class GrafanaService {
  constructor(endpoint, adminUser, adminPassword) {
    this.endpoint = endpoint.replace(/\/$/, '')
    this.headers = {
      'Authorization':
        'Basic ' + Buffer.from(adminUser + ':' + adminPassword, 'utf-8').toString('base64'),
      'Content-Type': 'application/json',
    }
  }

  protected endpoint: string
  protected headers: AxiosRequestHeaders

  /**
   * Configure the reader user into the grafana instance with the given password. If the password is not provided, a random one will be generated
   *
   * @param {string} password The password, can be omitted for generating a new one
   * @return {*}  {Promise<string>} The password used to configure the user
   */
  public async configureReader(password) {
    return await this.configureUser(Env.get('VITE_DOCKER_GRAFANA_READ_USER'), password, 'Viewer')
  }

  /**
   * Configure the writer user into the grafana instance with the given password. If the password is not provided, a random one will be generated
   *
   * @param {string} password The password, can be omitted for generating a new one
   * @return {*}  {Promise<string>} The password used to configure the user
   */
  public async configureWriter(password) {
    return await this.configureUser(Env.get('VITE_DOCKER_GRAFANA_WRITE_USER'), password, 'Editor')
  }

  /**
   * Get the cookies for the reader user
   * @param {string} password The password of the reader user (stored on the project)
   * @return {*}  {Promise<{ grafana_session: string; grafana_session_expiry: string }>}
   */
  public async getReaderCookies(password) {
    return await this.getCookies(Env.get('VITE_DOCKER_GRAFANA_READ_USER'), password)
  }

  /**
   * Get the cookies for the writer user
   * @param {string} password The password of the writer user (stored on the project)
   * @return {*}  {Promise<{ grafana_session: string; grafana_session_expiry: string }>}
   */
  public async getWriterCookies(password) {
    return await this.getCookies(Env.get('VITE_DOCKER_GRAFANA_WRITE_USER'), password)
  }

  /**
   * Get the cookies for the admin user
   * @return {*}  {Promise<{ grafana_session: string; grafana_session_expiry: string }>}
   */
  public async getAdminCookies() {
    return await this.getCookies(
      Env.get('DOCKER_GRAFANA_ADMIN_USER'),
      Env.get('DOCKER_GRAFANA_ADMIN_PASSWORD')
    )
  }

  /**
   * Wait for the grafana instance to become available
   * @param {number} seconds The maximum time to wait for the instance to become available
   */
  public async waitForAvailability(seconds) {
    const startTime = Date.now()
    let lastError = null

    const checkAvailability = async () => {
      if ((Date.now() - startTime) / 1000 > seconds) {
        throw (
          lastError || new Error(`Grafana n'est pas devenu disponible après ${seconds} secondes.`)
        )
      }

      try {
        await axios.get(this.endpoint + '/api/admin/settings', {
          headers: this.headers,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          })
        })
        return true // Grafana est disponible
      } catch (error) {
        lastError = error
        // Attendre une seconde avant de réessayer
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return checkAvailability()
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 5000))

    return checkAvailability()
  }

  protected async getCookies(user, password) {
    const response = await axios.post(
      this.endpoint + '/login',
      { user, password },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        })
      }
    )

    const cookies = {}
    ;(response.headers['set-cookie'] || []).forEach((cookie) => {
      const cookieParts = cookie.split(';')
      cookieParts.forEach((part) => {
        const [name, value] = part.trim().split('=')
        cookies[name] = value
      })
    })

    return {
      grafana_session: cookies['grafana_session'],
      grafana_session_expiry: cookies['grafana_session_expiry'],
    }
  }

  public async configureOrg() {
    const response = await axios.put(
      this.endpoint + '/api/org/preferences',
      {
        theme: 'light',
        timezone: 'utc',
      },
      {
        headers: this.headers,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        })
      }
    )

    return response.data
  }

  protected async configureUser(name, password, role) {
    if (!password || password === '') {
      password = this.generatePassword(20)
    }

    console.log('[GrafanaService] Searching if the ' + name + ' exists ...')
    let user = await this.getUser(name)
    if (user === false) {
      console.log('[GrafanaService] The user ' + name + ' does not exists, creating it ...')
      user = await this.createUser(name, password)
    } else {
      console.log(
        '[GrafanaService] User ' + name + ' exists with id ' + user.id + ', updating password ...'
      )
      await this.updateUserPassword(user.id, password)
    }

    console.log('[GrafanaService] Updating role (' + role + ') to user ' + user.id + ' ...')
    await this.updateUserRole(user.id, role)

    return password
  }

  protected async getUser(name) {
    try {
      const response = await axios.get(this.endpoint + '/api/users/lookup', {
        params: {
          loginOrEmail: name,
        },
        headers: this.headers,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        })
      })

      return response.data
    } catch (error) {
      return false
    }
  }

  protected async createUser(name, password) {
    const response = await axios.post(
      this.endpoint + '/api/admin/users',
      {
        name: name,
        email: name + '@example.com',
        login: name,
        password: password,
      },
      {
        headers: this.headers,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        })
      }
    )

    return response.data
  }

  protected async updateUserRole(id, role) {
    const response = await axios.patch(
      this.endpoint + '/api/org/users/' + id,
      { role },
      {
        headers: this.headers,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        })
      }
    )

    return response.data
  }

  protected async updateUserPassword(id, password) {
    const response = await axios.put(
      this.endpoint + '/api/admin/users/' + id + '/password',
      {
        password: password,
      },
      {
        headers: this.headers,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        })
      }
    )

    return response.data
  }

  protected generatePassword(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let password = ''

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }

    return password
  }
}
