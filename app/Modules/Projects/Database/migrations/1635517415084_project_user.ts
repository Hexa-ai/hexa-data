import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ProjectUser extends BaseSchema {
  protected tableName = 'project_user'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('role').defaultTo(1)
      table
        .integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('project_id')
        .unsigned()
        .references('projects.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.unique(['user_id', 'project_id'])
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
