import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ChangeDashboardRelationToDevices extends BaseSchema {
  protected tableName = 'devices'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('dashboard_id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('dashboard_id').references('dashboards.id')
    })
  }
}
