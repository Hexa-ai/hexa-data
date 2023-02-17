import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddProjectOwners extends BaseSchema {
  protected tableName = 'projects'

  public async up () {
    this.schema.alterTable('projects', (table) => {
      table.integer('owner_id').unsigned().references('users.id').onDelete('CASCADE').onUpdate('CASCADE')
    })
  }

  public async down () {
    this.schema.alterTable('projects', (table) => {
      table.dropForeign('owner_id')
    })
  }
}
