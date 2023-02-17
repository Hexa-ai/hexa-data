import test from 'japa'
import supertest from 'supertest'
import createLoggedUser from '../../../../test/utils/createLoggedUser'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}/api/v1`

test.group('---> Auth routes <---', () => {
  test('Register', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/register')
      .field('name', 'Robert')
      .field('email', 'robert@test.com')
      .field('password', '12345678')
      .expect('Content-Type', /json/)
      .expect(201)
    assert.equal(response.body.name, 'Robert')
    assert.equal(response.body.email, 'robert@test.com')
    assert.notEqual(response.body.password, '12345678')
    assert.notExists(response.body.is_activated)
  })
  test('Login', async (assert) => {
    const user = {
      email: 'admin@admin.com',
      password: '12345678',
    }
    const response = await supertest(BASE_URL).post('/login').send(user).expect(200)
    assert.exists(response.body.token)
  })
  test('AuthRequest', async () => {
    await createLoggedUser(BASE_URL)
  })
})
