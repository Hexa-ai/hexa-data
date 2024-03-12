import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import createLoggedUser from '../../../../test/utils/createLoggedUser'
import Project from '../Models/Project'
import { ProjectFactory } from '../Database/factories'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}/api/v1`

test.group('---> Projects routes with external service <---', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
  group.timeout(6000)
  test('Create', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    const response = await supertest(BASE_URL)
      .post('/projects')
      .set('Authorization', token)
      .field('name', 'Test Project')
      .field('description', 'A project for functionnality testing purpose')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(201)

    assert.equal(response.body.name, 'Test Project')
    assert.equal(response.body.description, 'A project for functionnality testing purpose')
  })
  test('Update all token', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token
    await supertest(BASE_URL)
      .post('/projects')
      .set('Authorization', token)
      .field('name', 'Test Project')
      .field('description', 'A project for functionnality testing purpose')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(201)

    const done = await Project.updateAllTokens()

    assert.equal(done, true)
  })
  test('Import', async () => {
    const token = (await createLoggedUser(BASE_URL)).token

    // Create 1 fake project
    await ProjectFactory.createMany(1)

    await supertest(BASE_URL)
      .post('/projects/import/1')
      .set('Authorization', token)
      .attach('archive', 'app/Modules/Projects/Tests/files/projetTestDev.zip')
      .expect(200)
  })
  test('Export', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token

    // Create 1 fake project
    const project = await ProjectFactory.createMany(1)

    const response = await supertest(BASE_URL)
      .get('/projects/export/1')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)

    assert.equal(response.body.name, project[0].name)
  })
})
