import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AppSettings extends BaseSchema {
  protected tableName = 'app_settings'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('app_title')
      table.string('app_sub_title1')
      table.string('app_sub_title2')
      table.string('app_sub_title3')
      table.string('app_icon',511)
      table.string('app_login_background',511)
      table.string('app_company_name')
      table.string('app_company_adress')
      table.string('app_company_website')
      table.string('app_company_email')
      table.string('app_company_phone_number')
      table.string('app_default_language')
      table.string('app_menu_bg_body_color')
      table.string('app_menu_bg_over_body_color')
      table.string('app_menu_bg_current_body_color')
      table.string('app_menu_font_body_color')
      table.string('app_menu_font_over_body_color')
      table.string('app_menu_bg_header_color')
      table.string('app_menu_font_header_color')
      table.string('app_primary_color')
      table.string('app_primary_over_color')
      table.string('app_primary_focus_ring_color')




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
