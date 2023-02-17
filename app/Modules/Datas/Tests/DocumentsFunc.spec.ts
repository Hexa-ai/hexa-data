import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import createLoggedUser from '../../../../test/utils/createLoggedUser'
import { DocumentFactory } from '../Database/factories'
import { ProjectFactory } from '../../Projects/Database/factories'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}/api/v1`

test.group('---> Documents routes <---', (group) => {
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
    // Créate 1 fake document
    await DocumentFactory.createMany(1)


    const response = await supertest(BASE_URL)
      .get('/projects/1/documents')
      .query({ type: 0 })
      .query({ page: 1 })
      .query({ perPage: 10 })
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.lengthOf(response.body.data, 1)
  })
  test('Store', async () => {
    const token = (await createLoggedUser(BASE_URL)).token

    // Create 1 fake project
    await ProjectFactory.createMany(1)


    await supertest(BASE_URL)
      .post('/projects/1/documents')
      .set('Authorization', token)
      .attach('file', 'app/Modules/Datas/Tests/files/csvTagsOk.csv')
      .expect('Content-Type', /json/)
      .expect(201)
  })
  test('Destroy', async () => {
    const token = (await createLoggedUser(BASE_URL)).token

    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Créate 1 fake document
    await DocumentFactory.createMany(1)


     await supertest(BASE_URL)
      .delete('/projects/1/documents/1')
      .set('Authorization', token)
      .expect(200)

  })
})
