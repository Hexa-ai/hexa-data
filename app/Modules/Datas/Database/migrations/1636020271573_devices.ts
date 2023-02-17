import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Devices extends BaseSchema {
  protected tableName = 'devices'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 255).notNullable()
      table.string('namespace', 255).notNullable()
      table.text('description').nullable()
      table.string('adress', 255).nullable()
      table.decimal('long').nullable()
      table.decimal('lat').nullable()
      table.string('client_id', 180).nullable()
      table.string('username', 180).nullable()
      table.string('password', 180).nullable()
      table.integer('project_id').unsigned().references('projects.id').onDelete('CASCADE').onUpdate('CASCADE')
      table.unique(['name', 'project_id'])
      table.unique(['client_id'])
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
