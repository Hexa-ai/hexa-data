import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    this.schema.alterTable('projects', (table) => {
      table.string('variable_type').defaultTo('LEGACY').after('dashboard_grafana_read_password')
    })
  }

  public async down() {
    this.schema.alterTable('projects', (table) => {
      table.dropColumn('variable_type')
    })
  }
}
