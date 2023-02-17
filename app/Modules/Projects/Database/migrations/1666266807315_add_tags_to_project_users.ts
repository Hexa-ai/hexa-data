import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'project_user'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('tags').defaultTo('')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tags')
    })
  }
}
