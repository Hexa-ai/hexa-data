import User from '../../Models/User'
import Factory from '@ioc:Adonis/Lucid/Factory'

export const UserFactory = Factory
  .define(User, ({ faker }) => {
    return {
      name: faker.internet.userName(),
      email: faker.internet.email(),
      password: '12345678',
      isActivated: true,
      isAdmin: false,
    }
  })
  .build()
