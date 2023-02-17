import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Dashboards extends BaseSchema {
  protected tableName = 'dashboards'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('description_l1').nullable()
      table.string('description_l2').nullable()
      table.string('description_l3').nullable()
      table.text('body').nullable
      table.boolean('stared').defaultTo(false)
      table.integer('project_id').unsigned().references('projects.id').onDelete('CASCADE').onUpdate('CASCADE')
      table.unique(['name', 'project_id'])

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
