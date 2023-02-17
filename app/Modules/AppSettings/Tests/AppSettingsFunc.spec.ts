import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import createLoggedUser from '../../../../test/utils/createLoggedUser'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}/api/v1`

test.group('---> AppSettings routes <---', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
  group.timeout(6000)

  test('get publicAppSettings', async (assert) => {

    const response = await supertest(BASE_URL)
      .get('/publicAppSettings')
      .expect('Content-Type', /json/)
      .expect(200)

    assert.equal(response.body.appTitle, 'Hexa-Data')
    assert.equal(response.body.appSubTitle1, 'Connecter et exploiter tout le potentiel de vos installations')
    assert.equal(response.body.appSubTitle2, 'Connect and exploit the full potential of your facilities')
    assert.equal(response.body.appSubTitle3, 'قم بتوصيل واستغلال الإمكانات الكاملة لمنشآتك')
    assert.equal(response.body.appIcon, null)
    assert.equal(response.body.appLoginBackground, null)
    assert.equal(response.body.appCompanyName, null)
    assert.equal(response.body.appCompanyAdress, null)
    assert.equal(response.body.appCompanyWebsite, null)
    assert.equal(response.body.appCompanyEmail, null)
    assert.equal(response.body.appCompanyPhoneNumber, null)
    assert.equal(response.body.appDefaultLanguage, 'fr')
    assert.equal(response.body.appMenuBgBodyColor, '#1f2937')
    assert.equal(response.body.appMenuBgOverBodyColor, '#374151')
    assert.equal(response.body.appMenuBgCurrentBodyColor, '#111827')
    assert.equal(response.body.appMenuFontBodyColor, '#d1d5db')
    assert.equal(response.body.appMenuFontOverBodyColor, '#9ca3af')
    assert.equal(response.body.appMenuBgHeaderColor, '#FFFFFF')
    assert.equal(response.body.appMenuFontHeaderColor, '#111827')
    assert.equal(response.body.appPrimaryColor, '#dc2626')
    assert.equal(response.body.appPrimaryOverColor, '#b91c1c')
    assert.equal(response.body.appPrimaryFocusRingColor, '#f87171')
  })

  test('get allAppSettings (Not admin)', async () => {

    await supertest(BASE_URL)
      .get('/allAppSettings')
      .expect('Content-Type', /json/)
      .expect(401)

  })
  test('get allAppSettings (Admin)', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token

    const response = await supertest(BASE_URL)
      .get('/allAppSettings')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)

    assert.equal(response.body.appTitle, 'Hexa-Data')
    assert.equal(response.body.appSubTitle1, 'Connecter et exploiter tout le potentiel de vos installations')
    assert.equal(response.body.appSubTitle2, 'Connect and exploit the full potential of your facilities')
    assert.equal(response.body.appSubTitle3, 'قم بتوصيل واستغلال الإمكانات الكاملة لمنشآتك')
    assert.equal(response.body.appIcon, null)
    assert.equal(response.body.appLoginBackground, null)
    assert.equal(response.body.appCompanyName, null)
    assert.equal(response.body.appCompanyAdress, null)
    assert.equal(response.body.appCompanyWebsite, null)
    assert.equal(response.body.appCompanyEmail, null)
    assert.equal(response.body.appCompanyPhoneNumber, null)
    assert.equal(response.body.appDefaultLanguage, 'fr')
    assert.equal(response.body.appMenuBgBodyColor, '#1f2937')
    assert.equal(response.body.appMenuBgOverBodyColor, '#374151')
    assert.equal(response.body.appMenuBgCurrentBodyColor, '#111827')
    assert.equal(response.body.appMenuFontBodyColor, '#d1d5db')
    assert.equal(response.body.appMenuFontOverBodyColor, '#9ca3af')
    assert.equal(response.body.appMenuBgHeaderColor, '#FFFFFF')
    assert.equal(response.body.appMenuFontHeaderColor, '#111827')
    assert.equal(response.body.appPrimaryColor, '#dc2626')
    assert.equal(response.body.appPrimaryOverColor, '#b91c1c')
    assert.equal(response.body.appPrimaryFocusRingColor, '#f87171')
  })
  test('Update allAppSettings (Admin)', async (assert) => {
    const token = (await createLoggedUser(BASE_URL)).token

    const updateResponse = await supertest(BASE_URL)
      .patch("/allAppSettings")
      .set("Authorization", token)
      .field('appTitle', 'Hexa-Test')

      .expect("Content-Type", /json/)
      .expect(200)

      assert.equal(updateResponse.body.appTitle, 'Hexa-Test')
  })

})
