import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tags'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('physical_unit').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('physical_unit')
    })
  }
}
