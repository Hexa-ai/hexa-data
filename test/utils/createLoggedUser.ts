import supertest from 'supertest'

interface Props {
  name: string
  email: string
  token: string
}

async function createLoggedUser(baseUrl: string, email?: string, password?: string) {
  const { body: authResponse } = await supertest(baseUrl)
    .post('/login')
    .send({ email: email || 'admin@admin.com', password: password || '12345678' })
  const user: Props = {
    name: authResponse.name,
    email: authResponse.email,
    token: 'Bearer ' + authResponse.token.token,
  }
  console.log('Created ')
  return user
}

export default createLoggedUser
