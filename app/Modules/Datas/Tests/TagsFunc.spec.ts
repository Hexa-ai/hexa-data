import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import createLoggedUser from '../../../../test/utils/createLoggedUser'
import { ProjectFactory } from '../../Projects/Database/factories'
import { DeviceFactory } from '../Database/factories'
import { TagFactory } from '../Database/factories'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}/api/v1`

test.group('---> Tags routes <---', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
  test('Store type GTS (Admin)', async () => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)

    await supertest(BASE_URL)
      .post('/projects/1/tags')
      .set('Authorization', token)
      .field('name', 'TempSalon')
      .field('descriptionL1', 'Température du salon')
      .field('descriptionL2', 'living room temperature 1')
      .field('descriptionL3', 'درجة حرارة غرفة المعيشة 1')
      .field('unit', '°C')
      .field('type', 1)
      .field('valueType', 2)
      .field('script', '')
      .field('scriptOutput', '')
      .field('scriptInterval', '')
      .field('scriptLastExec', '')
      .field('deviceId', 1)
      .expect('Content-Type', /json/)
      .expect(201)
  })
  test('Index (Admin)', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)
    // Create 1 fake tag
    await TagFactory.createMany(1)

    const response = await supertest(BASE_URL)
      .get('/projects/1/tags')
      .query({ page: 1 })
      .query({ perPage: 10 })
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.lengthOf(response.body.data, 1)
  })
  test('Index (Admin + unknown searchKey value)', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)
    // Create 1 fake tag
    await TagFactory.createMany(1)

    const response = await supertest(BASE_URL)
      .get('/projects/1/tags')
      .query({ page: 1 })
      .query({ perPage: 10 })
      .query({ searchKey: 'Jhon' })
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.lengthOf(response.body.data, 0)
  })
  test('Index (Admin +  ok typeFilter)', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)
    // Create 1 fake tag
    await TagFactory.createMany(1)

    const response = await supertest(BASE_URL)
      .get('/projects/1/tags')
      .query({ page: 1 })
      .query({ perPage: 10 })
      .query({ typeFilter: 1 })
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.lengthOf(response.body.data, 1)
  })
  test('Index (Admin + no result typeFilter)', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)
    // Create 1 fake tag
    await TagFactory.createMany(1)

    const response = await supertest(BASE_URL)
      .get('/projects/1/tags')
      .query({ page: 1 })
      .query({ perPage: 10 })
      .query({ typeFilter: 3 })
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.lengthOf(response.body.data, 0)
  })
  test('Store type GTS with no device ID (Admin)', async () => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)

    await supertest(BASE_URL)
      .post('/projects/1/tags')
      .set('Authorization', token)
      .field('name', 'TempCuisine')
      .field('descriptionL1', 'Température du salon')
      .field('descriptionL2', 'living room temperature 1')
      .field('descriptionL3', 'درجة حرارة غرفة المعيشة 1')
      .field('unit', '°C')
      .field('type', 1)
      .field('script', '')
      .field('scriptOutput', '')
      .field('scriptInterval', '')
      .field('scriptLastExec', '')
      .expect('Content-Type', /json/)
      .expect(422)
  })
  test('Store type GTS with name that already exist (Admin)', async () => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)
    // Create 1 fake tag
    const tag = await TagFactory.createMany(1)

    await supertest(BASE_URL)
      .post('/projects/1/tags')
      .set('Authorization', token)
      .field('name', tag[0].name)
      .field('descriptionL1', 'Température du salon')
      .field('descriptionL2', 'living room temperature 1')
      .field('descriptionL3', 'درجة حرارة غرفة المعيشة 1')
      .field('unit', '°C')
      .field('type', 1)
      .field('script', '')
      .field('scriptOutput', '')
      .field('scriptInterval', '')
      .field('scriptLastExec', '')
      .field('deviceId', 1)
      .expect('Content-Type', /json/)
      .expect(422)
  })
  test("Update", async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)
    // Create 1 fake tag
    const tag = await TagFactory.createMany(1)

    const response = await supertest(BASE_URL)
      .patch("/projects/1/tags/1")
      .set("Authorization", token)
      .field('name', tag[0].name)
      .field('descriptionL1', 'Température du salon 1')
      .field('descriptionL2', 'living room temperature 1')
      .field('descriptionL3', 'درجة حرارة غرفة المعيشة 1')
      .field('unit', '°C')
      .field('type', 1)
      .field('valueType', 1)
      .field('script', '')
      .field('scriptOutput', '')
      .field('scriptInterval', '')
      .field('scriptLastExec', '')
      .field('deviceId', 1)
      .set("Authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)

    assert.equal(response.body.name, tag[0].name)
    assert.equal(response.body.descriptionL1, 'Température du salon 1')
  })
  test("Update try to update the name", async () => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)
    // Create 1 fake tag
    const tag = await TagFactory.createMany(1)

    await supertest(BASE_URL)
      .patch("/projects/1/tags/1")
      .set("Authorization", token)
      .field('name', tag[0].name + '2')
      .field('descriptionL1', 'Température du salon 1')
      .field('descriptionL2', 'living room temperature 1')
      .field('descriptionL3', 'درجة حرارة غرفة المعيشة 1')
      .field('unit', '°C')
      .field('type', 1)
      .field('valueType', 2)
      .field('script', '')
      .field('scriptOutput', '')
      .field('scriptInterval', '')
      .field('scriptLastExec', '')
      .field('deviceId', 1)
      .set("Authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)

  })
  test("Delete", async () => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)
    // Create 1 fake tag
    await TagFactory.createMany(1)

    await supertest(BASE_URL).delete("/projects/1/tags/1")
      .set("Authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
  })
  test('Import CSV OK (Admin)', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)

    const response = await supertest(BASE_URL)
      .post('/projects/1/tags/importCsv')
      .set('Authorization', token)
      .attach('csvFile', 'app/Modules/Datas/Tests/files/csvTagsOk.csv')
      .expect('Content-Type', /json/)
      .expect(200)
    assert.equal(response.body.errorsNumber, 0)
  })
  test('Import CSV KO (Admin)', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)

    const response = await supertest(BASE_URL)
      .post('/projects/1/tags/importCsv')
      .set('Authorization', token)
      .attach('csvFile', 'app/Modules/Datas/Tests/files/csvTagsKo.csv')
      .expect('Content-Type', /json/)
      .expect(200)
    assert.equal(response.body.errorsNumber, 9)
  })
  test('Export CSV (Admin)', async () => {
    const token = (await createLoggedUser(BASE_URL)).token
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)

    await supertest(BASE_URL)
      .post('/projects/1/tags/importCsv')
      .set('Authorization', token)
      .attach('csvFile', 'app/Modules/Datas/Tests/files/csvTagsOk.csv')
      .expect('Content-Type', /json/)
      .expect(200)

    await supertest(BASE_URL)
      .get('/projects/1/tags/exportCsv')
      .set('Authorization', token)
      .expect('Content-Type',  'text/plain; charset=utf-8')
      .expect(200)
  })
})
