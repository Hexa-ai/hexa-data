import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddDashboardToDevices extends BaseSchema {
  protected tableName = 'devices'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('dashboard_id').unsigned().references('dashboards.id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('dashboard_id')
      table.dropColumn('dashboard_id')
    })
  }
}
