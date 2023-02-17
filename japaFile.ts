import 'reflect-metadata'
import { join } from 'path'
import getPort from 'get-port'
import { configure } from 'japa'
import execa from 'execa'
import sourceMapSupport from 'source-map-support'

process.env.NODE_ENV = 'testing'
process.env.ADONIS_ACE_CWD = join(__dirname)
sourceMapSupport.install({ handleUncaughtExceptions: false })

async function runMigrations() {
  await execa.node('ace', ['migration:run'], {
    stdio: 'inherit',
  })
}
async function rollbackMigrations() {
  await execa.node('ace', ['migration:rollback', '--batch=0'], {
    stdio: 'inherit',
  })
}
async function seedDb() {
  await execa.node('ace', ['db:seed'], {
    stdio: 'inherit',
  })
}
async function startHttpServer() {
  const { Ignitor } = await import('@adonisjs/core/build/src/Ignitor')
  process.env.PORT = String(await getPort())


  await new Ignitor(__dirname).httpServer().start()
}


function getTestFiles() {
  let userOption = process.argv.slice(2)[0]
  if (!userOption) {
    return 'app/Modules/**/Tests/*.spec.ts'
  } else if (userOption=='-ci') {
    return 'app/Modules/**/Tests/*Func.spec.ts'
  }

  return `${userOption.replace(/\.ts$|\.js$/, '')}.ts`
}
/**
 * Configure test runner
 */
configure({
  files: getTestFiles(),
  before: [runMigrations, seedDb, startHttpServer],
  after: [rollbackMigrations],
})
