import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  public async up () {
    this.schema.alterTable('projects', (table) => {
      table.string('dashboard_v2_grafana_url').nullable().after('persistent_token_expiry')
      table.tinyint('dashboard_version').defaultTo(1).after('persistent_token_expiry')
    })
  }

  public async down () {
    this.schema.alterTable('projects', (table) => {
      table.dropColumn('dashboard_v2_grafana_url')
      table.dropColumn('dashboard_version')
    })
  }
}
