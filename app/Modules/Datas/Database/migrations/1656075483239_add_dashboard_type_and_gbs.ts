import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddDashboardTypeAndGbs extends BaseSchema {
  protected tableName = 'dashboards'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('img_bg', 511).nullable()
      table.boolean('enable_img_bg').defaultTo(false)
      table.string('color_bg', 10).defaultTo('#FFFFFF')
      table.string('type', 30).notNullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('img_bg')
      table.dropColumn('enable_img_bg')
      table.dropColumn('color_bg')
      table.dropColumn('type')
    })
  }
}
