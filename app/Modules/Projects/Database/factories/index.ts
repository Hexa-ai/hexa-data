import Project from '../../Models/Project'
import Factory from '@ioc:Adonis/Lucid/Factory'

export const ProjectFactory = Factory.define(Project, ({ faker }) => {
  return {
    name: faker.name.jobTitle(),
    description: faker.lorem.sentence(),
    uuid: 'abfd62ae-b6b9-463d-b690-5381a8ccb788',
  }
}).build()
