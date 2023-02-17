import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import createLoggedUser from '../../../../test/utils/createLoggedUser'
import { UserFactory } from '../Database/factories'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}/api/v1`

test.group('---> Users routes <---', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
  test('Index', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    const indexResponse = await supertest(BASE_URL)
      .get('/users')
      .query({ page: 1 })
      .query({ perPage: 10 })
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      
    assert.equal(indexResponse.body.data[1].name, 'admin')
    assert.equal(indexResponse.body.data[1].email, 'admin@admin.com')
    assert.equal(indexResponse.body.data[1].lang, 'fr')
    assert.notEqual(indexResponse.body.data[1].password, '12345678')
    assert.equal(indexResponse.body.data[1].isActivated, true)
    assert.equal(indexResponse.body.data[1].isAdmin, true)
  })
  test('Index (unknown searchKey value)', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    const indexResponse = await supertest(BASE_URL)
      .get('/users')
      .query({ page: 1 })
      .query({ perPage: 10 })
      .query({ searchKey: 'Jhon' })
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)

    assert.lengthOf(indexResponse.body.data,0)
  })
  test('Show', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    const showResponse = await supertest(BASE_URL)
    .get('/users/1')
    .set('Authorization', token)
    .expect('Content-Type', /json/)
    .expect(200)
  assert.equal(showResponse.body.name, 'admin')
  assert.equal(showResponse.body.email, 'admin@admin.com')
  assert.equal(showResponse.body.lang, 'fr')
  assert.notEqual(showResponse.body.password, '12345678')
  assert.equal(showResponse.body.isActivated, true)
  assert.equal(showResponse.body.isAdmin, true)
  })
  test('Store', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    const storeResponse = await supertest(BASE_URL)
      .post('/users')
      .set('Authorization', token)
      .field('name', 'julien')
      .field('email', 'julien@test.com')
      .field('lang', 'en')
      .field('password', '12345678')
      .field('isActivated', 'true')
      .field('isAdmin', 'false')
      .expect('Content-Type', /json/)
      .expect(201)

    assert.equal(storeResponse.body.name, 'julien')
    assert.equal(storeResponse.body.email, 'julien@test.com')
    assert.notEqual(storeResponse.body.password, '12345678')
    assert.equal(storeResponse.body.isActivated, true)
    assert.equal(storeResponse.body.isAdmin, false)
  })
  test('Update', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    let UpdateResponse = await supertest(BASE_URL)
      .patch('/users/2')
      .set('Authorization', token)
      .field('name', 'Marcus')
      .field('email', 'marcus@test.com')
      .field('lang', 'en')
      .field('password', '87654321')
      .field('isActivated', 'false')
      .field('isAdmin', 'false')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.equal(UpdateResponse.body.name, 'Marcus')
    assert.equal(UpdateResponse.body.email, 'marcus@test.com')
    assert.equal(UpdateResponse.body.lang, 'en')
    assert.notEqual(UpdateResponse.body.password, '87654321')
    assert.equal(UpdateResponse.body.isActivated, false)
    assert.equal(UpdateResponse.body.isAdmin, false)
  })
  test('Simple user try update own profile', async (assert) => {
    // Create 2 fake users
    const users = await UserFactory.createMany(2)

    const token = (await createLoggedUser(BASE_URL,users[0].email,'12345678')).token
    let UpdateResponse = await supertest(BASE_URL)
      .patch('/users/' + users[0].id)
      .set('Authorization', token)
      .field('name', users[0].name)
      .field('email', users[0].email)
      .field('lang', 'en')
      .field('password', '87654321')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.equal(UpdateResponse.body.name, users[0].name)
    assert.equal(UpdateResponse.body.email, users[0].email)
    assert.equal(UpdateResponse.body.lang, 'en')
    assert.notEqual(UpdateResponse.body.password, '87654321')
  })
  test('Simple user try update other profile', async () => {
    // Create 2 fake users
    const users = await UserFactory.createMany(2)
    const token = (await createLoggedUser(BASE_URL,users[0].email,'12345678')).token
    await supertest(BASE_URL)
      .patch('/users/'+ 1)
      .set('Authorization', token)
      .field('name', users[0].name)
      .field('email', 'blabla@test.com')
      .field('lang', 'en')
      .field('password', '87654321')
      .field('isActivated', 'false')
      .field('isAdmin', 'false')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(403)
  })
  test('Delete', async () => {
    const token = (await createLoggedUser(BASE_URL)).token
    await supertest(BASE_URL)
      .delete('/users/2')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    await supertest(BASE_URL).get('/users/2').set('Authorization', token).expect(204)
  })
})
