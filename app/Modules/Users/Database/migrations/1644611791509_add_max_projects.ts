import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddMaxProjects extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable('users', (table) => {
      table.integer('max_projects').defaultTo(0)
      table.integer('max_devices').defaultTo(0)
      table.integer('max_variables').defaultTo(0)
      table.integer('max_macros').defaultTo(0)
    })
  }

  public async down () {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('max_projects')
      table.dropColumn('max_devices')
      table.dropColumn('max_variables')
      table.dropColumn('max_macros')
    })
  }
}
