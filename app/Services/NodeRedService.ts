import Env from '@ioc:Adonis/Core/Env'
import axios from 'axios'
import https from 'https'

export default class NodeRedService {
  constructor(endpoint) {
    this.endpoint = endpoint.replace(/\/$/, '')
  }

  protected endpoint: string

  public async getWriterToken(password) {
    return await this.getToken(Env.get('VITE_DOCKER_NODERED_WRITE_USER'), password)
  }

  public async getAdminToken() {
    return await this.getToken(
      Env.get('DOCKER_NODERED_ADMIN_USER'),
      Env.get('DOCKER_NODERED_ADMIN_PASSWORD')
    )
  }

  protected async getToken(user, password) {
    const params = new URLSearchParams()
    params.append('client_id', 'node-red-editor')
    params.append('grant_type', 'password')
    params.append('scope', '')
    params.append('username', user)
    params.append('password', password)

    const response = await axios.post(this.endpoint + '/auth/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    })
    
    return response.data
  }
}
