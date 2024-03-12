import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    this.schema.alterTable('projects', (table) => {
      table.dropColumn('dashboard_grafana_read_password')
      table.dropColumn('dashboard_grafana_write_password')
      table.dropColumn('dashboard_grafana_url')
      table.dropColumn('dashboard_type')
      
      table.string('grafana_writer_password').nullable().after('persistent_token_expiry')
      table.string('grafana_reader_password').nullable().after('persistent_token_expiry')
      table.text('grafana_configuration').nullable().after('persistent_token_expiry')
      table.string('grafana_version').nullable().after('persistent_token_expiry')
      table.string('grafana_url').nullable().after('persistent_token_expiry')
      table.enum('grafana_mode', ['MANAGED', 'EXTERNAL']).nullable().after('persistent_token_expiry')
      table.boolean('grafana_enabled').defaultTo(false).after('persistent_token_expiry')
    })
  }

  public async down() {
    this.schema.alterTable('projects', (table) => {
      table.string('dashboard_grafana_read_password').nullable().after('persistent_token_expiry')
      table.string('dashboard_grafana_write_password').nullable().after('persistent_token_expiry')
      table.string('dashboard_grafana_url').nullable().after('persistent_token_expiry')
      table.string('dashboard_type').defaultTo('LEGACY').after('persistent_token_expiry')

      table.dropColumn('grafana_enabled')
      table.dropColumn('grafana_mode')
      table.dropColumn('grafana_url')
      table.dropColumn('grafana_version')
      table.dropColumn('grafana_configuration')
      table.dropColumn('grafana_reader_password')
      table.dropColumn('grafana_writer_password')
    })
  }
}
