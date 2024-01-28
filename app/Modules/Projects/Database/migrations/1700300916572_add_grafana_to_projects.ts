import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    this.schema.alterTable('projects', (table) => {
      table.string('dashboard_grafana_read_password').nullable().after('persistent_token_expiry')
      table.string('dashboard_grafana_write_password').nullable().after('persistent_token_expiry')
      table.string('dashboard_grafana_url').nullable().after('persistent_token_expiry')
      table.string('dashboard_type').defaultTo('LEGACY').after('persistent_token_expiry')
    })
  }

  public async down() {
    this.schema.alterTable('projects', (table) => {
      table.dropColumn('dashboard_grafana_read_password')
      table.dropColumn('dashboard_grafana_write_password')
      table.dropColumn('dashboard_grafana_url')
      table.dropColumn('dashboard_type')
    })
  }
}
