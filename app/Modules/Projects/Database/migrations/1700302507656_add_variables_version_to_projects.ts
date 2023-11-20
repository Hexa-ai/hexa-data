import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  public async up () {
    this.schema.alterTable('projects', (table) => {
      table.tinyint('variables_version').defaultTo(1).after('dashboard_v2_grafana_url')
    })
  }

  public async down () {
    this.schema.alterTable('projects', (table) => {
      table.dropColumn('variables_version')
    })
  }
}
