import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    this.schema.alterTable('projects', (table) => {
      table.timestamp('persistent_token_expiry').nullable().after('token_uuid')
      table.timestamp('persistent_token_issuance').nullable().after('token_uuid')
      table.string('persistent_write_token').nullable().after('token_uuid')
      table.string('persistent_read_token').nullable().after('token_uuid')
    })
  }

  public async down() {
    this.schema.alterTable('projects', (table) => {
      table.dropColumn('persistent_token_expiry')
      table.dropColumn('persistent_token_issuance')
      table.dropColumn('persistent_write_token')
      table.dropColumn('persistent_read_token')
    })
  }
}
