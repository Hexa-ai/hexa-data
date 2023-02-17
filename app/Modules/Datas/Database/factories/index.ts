import Device from '../../Models/Device'
import Tag from '../../Models/Tag'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { string } from '@ioc:Adonis/Core/Helpers'
import Dashboard from '../../Models/Dashboard'
import Document from '../../Models/Document'

export const DeviceFactory = Factory
  .define(Device, ({ faker }) => {
    const name = faker.name.jobTitle()
    const clientId = string.camelCase(name)
    const username = clientId + 'Usr'

    return {
      name: name,
      description: faker.lorem.sentence(),
      adress: faker.address.streetAddress(),
      lat: +faker.address.latitude(),
      long: +faker.address.longitude(),
      clientId: clientId,
      namespace:clientId,
      username: username,
      password: 'password',
      projectId: 1,
    }
  })
  .build()
export const TagFactory = Factory
.define(Tag, ({ faker }) => {
  return {
    name: faker.name.jobTitle(),
    descriptionL1: faker.lorem.sentence(),
    descriptionL2: faker.lorem.sentence(),
    descriptionL3: faker.lorem.sentence(),
    unit: '°C',
    type: 1,
    valueType: 2,
    deviceId:1,
    projectId: 1,
  }
})
.build()
export const DashboardFactory = Factory
.define(Dashboard, ({ faker }) => {
  return {
    name: faker.name.jobTitle(),
    descriptionL1: faker.lorem.sentence(),
    descriptionL2: faker.lorem.sentence(),
    descriptionL3: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(2),
    stared: faker.datatype.boolean(),
    type: 'continuum',
    projectId: 1,
  }
})
.build()
export const DocumentFactory = Factory
.define(Document, ({ faker }) => {
  return {
    name: faker.name.jobTitle(),
    type: 0,
    inProgress: faker.datatype.boolean(),
    projectId: 1,
  }
})
.build()
