import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tags extends BaseSchema {
  protected tableName = 'tags'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 255).notNullable()
      table.text('description_l1').nullable()
      table.text('description_l2').nullable()
      table.text('description_l3').nullable()
      table.string('unit', 255).nullable()
      // type values -> 1 GTS, 2 GTS for Text traduction, 3 WARPScript
      table.integer('type').notNullable()
      // value_type values -> 1 Boolean, 2 -> Integer, 3 -> Float, 4 -> String
      table.integer('value_type').nullable()
      table.text('script','mediumtext').nullable()
      table.text('script_output').nullable()
      table.integer('script_interval').nullable()
      table.timestamp('script_last_exec').nullable()
      table.integer('device_id').unsigned().references('devices.id').onDelete('CASCADE').onUpdate('CASCADE')
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
