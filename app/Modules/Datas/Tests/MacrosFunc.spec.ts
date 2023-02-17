import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import createLoggedUser from '../../../../test/utils/createLoggedUser'
import { ProjectFactory } from '../../Projects/Database/factories'
import { DeviceFactory } from '../Database/factories'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}/api/v1`

test.group('---> Macro routes <---', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
  test('GetMacro (Public)', async () => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)
    // Create 1 macro tag
    await supertest(BASE_URL)
      .post('/projects/1/tags')
      .set('Authorization', token)
      .field('name', 'TestMacro')
      .field('descriptionL1', 'Macro de test')
      .field('descriptionL2', 'Macro for testing purpose')
      .field('type', 3)
      .field('script', '<% NOW %> \'macro\' STORE $macro')
      .field('scriptInterval', 0)
      .expect('Content-Type', /json/)
      .expect(201)

    const response = await supertest(BASE_URL)
      .get('/macros/1/TestMacro.mc2')
      .set('Authorization', token)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(200)

   console.log(response.body.data)
  })
})
