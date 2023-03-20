import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tags'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.double('min_treshold').nullable()
      table.double('max_treshold').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('min_treshold')
      table.dropColumn('max_treshold')
    })
  }
}
