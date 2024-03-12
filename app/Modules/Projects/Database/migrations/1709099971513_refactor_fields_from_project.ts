import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    this.schema.alterTable('projects', (table) => {
      table.dropColumn('adress')
      table.dropColumn('long')
      table.dropColumn('lat')
      table.dropColumn('l1')
      table.dropColumn('l2')
      table.dropColumn('l3')
      table.dropColumn('variable_type')

      table.string('grafana_docker_port').nullable().after('grafana_writer_password')
      table.string('grafana_docker_host').nullable().after('grafana_writer_password')
      table.string('node_red_docker_port').nullable().after('node_red_configuration')
      table.string('node_red_docker_host').nullable().after('node_red_configuration')
      table.string('node_red_writer_password').nullable().after('node_red_configuration')
    })
  }

  public async down() {
    this.schema.alterTable('projects', (table) => {
      table.string('adress', 255).nullable()
      table.decimal('long').nullable()
      table.decimal('lat').nullable()
      table.string('l1', 3).nullable()
      table.string('l2', 3).nullable()
      table.string('l3', 3).nullable()
      table.string('variable_type').defaultTo('LEGACY').after('dashboard_grafana_read_password')

      table.dropColumn('grafana_docker_port')
      table.dropColumn('grafana_docker_host')
      table.dropColumn('node_red_docker_port')
      table.dropColumn('node_red_docker_host')
      table.dropColumn('node_red_writer_password')
    })
  }
}
