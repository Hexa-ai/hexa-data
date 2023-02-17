import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'app_settings'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('hd_ws_macro_last_update', { useTz: true }).nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('hd_ws_macro_last_update')
    })
  }
}
