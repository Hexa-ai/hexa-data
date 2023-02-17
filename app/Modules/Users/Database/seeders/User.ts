import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from '../../Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await User.createMany([
      {
        name: 'admin',
        email: 'admin@admin.com',
        password: '12345678',
        isActivated: true,
        isAdmin: true,
        lang: 'fr',
      },
    ])
  }
}
