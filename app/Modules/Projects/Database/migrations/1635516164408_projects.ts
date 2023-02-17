import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Projects extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('uuid')
      table.string('name', 255).notNullable()
      table.text('description').nullable()
      table.string('photo', 511).nullable()
      table.string('adress', 255).nullable()
      table.decimal('long').nullable()
      table.decimal('lat').nullable()
      table.string('l1', 3).nullable()
      table.string('l2', 3).nullable()
      table.string('l3', 3).nullable()
      table.string('export_link').nullable()
      table.timestamp('export_link_expiry', { useTz: true }).nullable()
      table.string('read_token').nullable()
      table.string('write_token').nullable()
      table.timestamp('token_issuance', { useTz: true }).nullable()
      table.timestamp('token_expiry', { useTz: true }).nullable()
      table.string('token_uuid').nullable()
      table.decimal('import_export_cmd').nullable()
      table.json('import_export_parameters').nullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
