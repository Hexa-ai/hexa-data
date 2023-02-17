import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import createLoggedUser from '../../../../test/utils/createLoggedUser'
import { DeviceFactory } from '../Database/factories'
import { ProjectFactory } from '../../Projects/Database/factories'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}/api/v1`

test.group('---> Devices routes <---', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
  group.timeout(6000)
  test('Index (Admin)', async (assert) => {
      const token = (await createLoggedUser(BASE_URL)).token

      // Create 1 fake project
      await ProjectFactory.createMany(1)
      // Create 1 fake device
      await DeviceFactory.createMany(1)

      const response = await supertest(BASE_URL)
        .get('/projects/1/devices')
        .query({ page: 1 })
        .query({ perPage: 10 })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
      assert.lengthOf(response.body.data,1)
  })
  test('Index (Admin + unknown searchKey value)', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token

    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)

    const response = await supertest(BASE_URL)
      .get('/projects/1/devices')
      .query({ page: 1 })
      .query({ perPage: 10 })
      .query({ searchKey: 'Jhon' })
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.lengthOf(response.body.data,0)
})
  test("Update", async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token

    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)

    const response = await supertest(BASE_URL)
      .patch("/projects/1/devices/1")
      .set("Authorization", token)
      .field('name', 'Update Test Device')
      .field('description', 'A device for functionnality testing purpose')
      .field('adress', '10 Rue du camion 22340 Saint-Augustin')
      .field('lat', 48.515720000000044)
      .field('long', -2.7638999999999783)
      .field('clientId', 'updateTestDevice')
      .field('username', 'TestDeviceUsr')
      .set("Authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      
    assert.equal(response.body.description, 'A device for functionnality testing purpose')
    assert.equal(response.body.adress, '10 Rue du camion 22340 Saint-Augustin')
    assert.equal(response.body.lat, 48.515720000000044)
    assert.equal(response.body.long, -2.7638999999999783)
    assert.equal(response.body.username, 'TestDeviceUsr')
  })
  test("Delete", async () => {
    const token = (await createLoggedUser(BASE_URL)).token

    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    await DeviceFactory.createMany(1)

    await supertest(BASE_URL).delete("/projects/1/devices/1")
      .set("Authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
    await supertest(BASE_URL).get("/projects/1/devices/1")
      .set("Authorization", token)
      .expect(404)
  })
  test('Store', async () => {
    // Create 1 fake project
    await ProjectFactory.createMany(1)

    const token = (await createLoggedUser(BASE_URL)).token
    await supertest(BASE_URL)
      .post('/projects/1/devices')
      .set('Authorization', token)
      .field('name', 'Test Device')
      .field('namespace', 'TestDevice')
      .field('description', 'A device for functionnality testing purpose')
      .field('adress', '10 Rue du camion 22340 Saint-Augustin')
      .field('lat', 48.515720000000044)
      .field('long', -2.7638999999999783)
      .field('clientId', 'TestDevice')
      .field('username', 'TestDeviceUsr')
      .field('password', 'sldjsjdfljfd')
      .expect('Content-Type', /json/)
      .expect(201)
  })
  test('Mqtt-Auth Good', async () => {
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    const device = await DeviceFactory.createMany(1)

    await supertest(BASE_URL)
      .post('/mqtt/auth')
      .field('clientId', device[0].clientId)
      .field('username', device[0].username)
      .field('password', 'password')
      .expect(200)
  })
  test('Mqtt-Auth Bad', async () => {
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    const device = await DeviceFactory.createMany(1)

    await supertest(BASE_URL)
      .post('/mqtt/auth')
      .field('clientId', device[0].clientId)
      .field('username', device[0].username)
      .field('password', '12345678')
      .expect(400)
  })
  test('Mqtt-ACL Sub Good', async () => {
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    const device = await DeviceFactory.createMany(1)

    await supertest(BASE_URL)
      .post('/mqtt/acl')
      .field('access', '1')
      .field('username', device[0].username)
      .field('clientId', device[0].clientId)
      .field('ipaddr', '127.0.0.1')
      .field('topic', 'HD/'+device[0].clientId+'/down')
      .field('mountpoint', '1')
      .expect(200)
  })
  test('Mqtt-ACL Sub Bad', async () => {
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    const device = await DeviceFactory.createMany(1)

    await supertest(BASE_URL)
      .post('/mqtt/acl')
      .field('access', '1')
      .field('username', device[0].username)
      .field('clientId', device[0].clientId)
      .field('ipaddr', '127.0.0.1')
      .field('topic', 'HD/blabla/down')
      .field('mountpoint', '1')
      .expect(400)
  })
  test('Mqtt-ACL Pub Good', async () => {
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    const device = await DeviceFactory.createMany(1)

    await supertest(BASE_URL)
      .post('/mqtt/acl')
      .field('access', '2')
      .field('username', device[0].username)
      .field('clientId', device[0].clientId)
      .field('ipaddr', '127.0.0.1')
      .field('topic', 'HD/'+device[0].clientId+'/up')
      .field('mountpoint', '1')
      .expect(200)
  })
  test('Mqtt-ACL Pub Bad', async () => {
    // Create 1 fake project
    await ProjectFactory.createMany(1)
    // Create 1 fake device
    const device = await DeviceFactory.createMany(1)

    await supertest(BASE_URL)
      .post('/mqtt/acl')
      .field('access', '2')
      .field('username', device[0].username)
      .field('clientId', device[0].clientId)
      .field('ipaddr', '127.0.0.1')
      .field('topic', 'HD/blabla/up')
      .field('mountpoint', '1')
      .expect(400)
  })
})
