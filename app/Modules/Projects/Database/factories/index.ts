import Project from '../../Models/Project'
import Factory from '@ioc:Adonis/Lucid/Factory'

export const ProjectFactory = Factory.define(Project, ({ faker }) => {
  return {
    name: faker.name.jobTitle(),
    description: faker.lorem.sentence(),
    adress: faker.address.streetAddress(),
    lat: +faker.address.latitude(),
    long: +faker.address.longitude(),
    uuid: 'abfd62ae-b6b9-463d-b690-5381a8ccb788',
    l1: 'fr',
    l2: 'en',
    l3: 'de',
  }
}).build()
