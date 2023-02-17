/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'
import Application from '@ioc:Adonis/Core/Application'

const databaseConfig: DatabaseConfig = {
  /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  |
  | The primary connection for making database queries across the application
  | You can use any key from the `connections` object defined in this same
  | file.
  |
  */
  connection: Env.get('DB_CONNECTION'),

  connections: {
    /*
    |--------------------------------------------------------------------------
    | MySQL config
    |--------------------------------------------------------------------------
    |
    | Configuration for MySQL database. Make sure to install the driver
    | from npm when using this connection
    |
    | npm i mysql
    |
    */
    mysql: {
      client: 'mysql',
      connection: {
        host: Env.get('MYSQL_HOST'),
        port: Env.get('MYSQL_PORT'),
        user: Env.get('MYSQL_USER'),
        password: Env.get('MYSQL_PASSWORD', ''),
        database: Env.get('MYSQL_DB_NAME'),
      },
      migrations: {
        naturalSort: true,
        paths: [
          './database/migrations',
          './app/Modules/Users/Database/migrations',
          './app/Modules/Projects/Database/migrations',
          './app/Modules/Datas/Database/migrations',
          './app/Modules/AppSettings/Database/migrations'
        ],
      },
      seeders: {
        paths: [
          './database/seeders',
          './app/Modules/Users/Database/seeders',
          './app/Modules/Projects/Database/seeders',
          './app/Modules/Datas/Database/seeders',
          './app/Modules/AppSettings/Database/seeders'
        ],
      },
      healthCheck: false,
      debug: false,
    },
    sqlite: {
      client: 'sqlite',
      connection: {
        filename: Application.tmpPath('db.sqlite3'),
      },
      migrations: {
        naturalSort: true,
        paths: [
          './database/migrations',
          './app/Modules/Users/Database/migrations',
          './app/Modules/Projects/Database/migrations',
          './app/Modules/Datas/Database/migrations',
          './app/Modules/AppSettings/Database/migrations'
        ],
      },
      seeders: {
        paths: [
          './database/seeders',
          './app/Modules/Users/Database/seeders',
          './app/Modules/Projects/Database/seeders',
          './app/Modules/Datas/Database/seeders',
          './app/Modules/AppSettings/Database/seeders'
        ],
      },
      useNullAsDefault: true,
      healthCheck: false,
      debug: false,
    },
  },
}

export default databaseConfig
