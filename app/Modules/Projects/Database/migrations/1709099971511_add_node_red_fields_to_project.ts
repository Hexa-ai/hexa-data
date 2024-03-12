import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    this.schema.alterTable('projects', (table) => {
      table.text('node_red_configuration').nullable().after('grafana_writer_password')
      table.string('node_red_version').nullable().after('grafana_writer_password')
      table.string('node_red_url').nullable().after('grafana_writer_password')
      table.enum('node_red_mode', ['MANAGED', 'EXTERNAL']).nullable().after('grafana_writer_password')
      table.boolean('node_red_enabled').defaultTo(false).after('grafana_writer_password')
    })
  }

  public async down() {
    this.schema.alterTable('projects', (table) => {
      table.dropColumn('node_red_enabled')
      table.dropColumn('node_red_mode')
      table.dropColumn('node_red_url')
      table.dropColumn('node_red_version')
      table.dropColumn('node_red_configuration')
    })
  }
}
