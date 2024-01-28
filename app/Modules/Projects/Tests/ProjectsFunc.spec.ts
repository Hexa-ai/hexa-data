import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import createLoggedUser from '../../../../test/utils/createLoggedUser'
import { UserFactory } from '../../Users/Database/factories'
import { ProjectFactory } from '../Database/factories'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}/api/v1`

test.group('---> Projects routes <---', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
  group.timeout(6000)

  test('Index', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)

    const response = await supertest(BASE_URL)
      .get('/projects')
      .query({ page: 1 })
      .query({ perPage: 10 })
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.lengthOf(response.body.data, 1)
  })
  test('Index (by non admin)', async (assert) => {
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 2 fake users
    const users = await UserFactory.createMany(2)

    const token = (await createLoggedUser(BASE_URL, users[0].email, '12345678')).token

    const response = await supertest(BASE_URL)
      .get('/projects')
      .query({ page: 1 })
      .query({ perPage: 10 })
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.lengthOf(response.body.data, 0)
  })
  test('Index (by non admin but affected on project)', async (assert) => {
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 2 fake users
    const users = await UserFactory.createMany(2)

    const AdminToken = (await createLoggedUser(BASE_URL)).token

    await supertest(BASE_URL)
      .post('/projects/1/invitation')
      .set('Authorization', AdminToken)
      .send({
        email: users[0].email,
      })
      .expect(201)

    const userToken = (await createLoggedUser(BASE_URL, users[0].email, '12345678')).token

    const response = await supertest(BASE_URL)
      .get('/projects')
      .query({ page: 1 })
      .query({ perPage: 10 })
      .set('Authorization', userToken)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.lengthOf(response.body.data, 1)
  })

  test('Index (unknown searchKey value)', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)

    const response = await supertest(BASE_URL)
      .get('/projects')
      .query({ page: 1 })
      .query({ perPage: 10 })
      .query({ searchKey: 'Jhon' })
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.lengthOf(response.body.data, 0)
  })
  test('Update (AppendUser, RemoveUser)', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token

    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 2 fake users
    const users = await UserFactory.createMany(2)

    await supertest(BASE_URL)
      .post('/projects/1/invitation')
      .set('Authorization', token)
      .send({
        email: users[0].email,
      })
      .expect(201)

    await supertest(BASE_URL)
      .post('/projects/1/invitation')
      .set('Authorization', token)
      .send({
        email: users[1].email,
      })
      .expect(201)
    // const appendUserResponse = await supertest(BASE_URL)
    //   .post('/projects/1/users')
    //   .set('Authorization', token)
    //   .send({
    //     users:[{id:users[0].id, role:Role.EDITOR},{id:users[1].id, role:Role.USER}]
    //   })
    //   .expect(200)
    // assert.equal(appendUserResponse.body.users[0].id, users[0].id)
    // assert.equal(appendUserResponse.body.users[0].role, Role.EDITOR)
    // assert.equal(appendUserResponse.body.users[1].id, users[1].id)
    // assert.equal(appendUserResponse.body.users[1].role, Role.USER)

    const updateResponse = await supertest(BASE_URL)
      .patch('/projects/1')
      .set('Authorization', token)
      .field('name', 'Update Test Project')
      .field('description', 'A project for functionnality testing purpose')
      .field('adress', '10 Rue du camion 22340 Saint-Augustin')
      .field('l1', 'fr')
      .field('l2', 'en')
      .field('l3', 'de')
      .field('lat', 48.515720000000044)
      .field('long', -2.7638999999999783)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.equal(updateResponse.body.name, 'Update Test Project')
    assert.equal(updateResponse.body.description, 'A project for functionnality testing purpose')
    assert.equal(updateResponse.body.adress, '10 Rue du camion 22340 Saint-Augustin')
    assert.equal(updateResponse.body.lat, 48.515720000000044)
    assert.equal(updateResponse.body.long, -2.7638999999999783)

    await supertest(BASE_URL)
      .delete('/projects/1/users/' + users[1].id)
      .set('Authorization', token)
      .expect(200)
  })
  test('Remove', async () => {
    const token = (await createLoggedUser(BASE_URL)).token

    // Create 1 fake project
    await ProjectFactory.createMany(1)

    await supertest(BASE_URL)
      .delete('/projects/1')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    await supertest(BASE_URL).get('/projects/1').set('Authorization', token).expect(404)
  })
})
