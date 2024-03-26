import { BaseCommand } from '@adonisjs/core/build/standalone'
import fs from 'fs-extra'
import path from 'path'
import execaUtils from '../app/Utils/execaUtils'

export default class AppBuild extends BaseCommand {
  public static commandName = 'app:build'

  public static description = 'Unified Adonis & Vite build'

  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  public async run() {
    const targetDir = path.resolve('./public/assets')
    await fs.remove(targetDir)
    // if (fs.existsSync('./.env')) {
    //   await fs.rename('./.env', './temp.env')
    // }
    await fs.rename('./.env.example', './.env')
    await execaUtils.execute('npm', ['run', 'build:vite'])
    await fs.rename('./.env', './.env.example')
    // if (fs.existsSync('./temp.env')) {
    //   await fs.rename('./temp.env', './.env')
    // }

    await fs.copy(path.resolve('./ui/node_modules/@senx'), path.resolve('./ui/dist/assets/@senx'))
    await fs.copy(
      path.resolve('./ui/node_modules/@hexa-ai'),
      path.resolve('./ui/dist/assets/@hexa-ai')
    )
    await fs.move(path.resolve('./ui/dist/assets'), targetDir)

    await fs.move(
      path.resolve('./ui/dist/manifest.json'),
      path.resolve('./public/assets/manifest.json')
    )

    await execaUtils.execute('npm', ['run', 'build:adonis'])

    await fs.remove(targetDir)
    await fs.remove(path.resolve('./ui/dist'))

    this.logger.info('Init Storage Dir')

    const buildDir = './build/'
    const importDir = buildDir + 'storage/import'
    const exportDir = buildDir + 'storage/export'
    const projectsPhotosDir = buildDir + 'storage/projectsPhotos'
    const appFilesDir = buildDir + 'storage/appFiles'
    const usersPhotosDir = buildDir + 'storage/usersPhotos'

    if (!fs.existsSync(importDir)) {
      fs.mkdirSync(importDir, { recursive: true })
    }
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true })
    }
    if (!fs.existsSync(projectsPhotosDir)) {
      fs.mkdirSync(projectsPhotosDir, { recursive: true })
    }
    if (!fs.existsSync(appFilesDir)) {
      fs.mkdirSync(appFilesDir, { recursive: true })
    }
    if (!fs.existsSync(usersPhotosDir)) {
      fs.mkdirSync(usersPhotosDir, { recursive: true })
    }

    await fs.copyFile('./docker-compose.yml.example', buildDir + 'docker-compose.yml')
    await fs.copyFile('./.env.example', buildDir + '.env')
    // await fs.copyFile('./.env', buildDir + '.env')
    await fs.copyFile('./ecosystem.config.js', buildDir + 'ecosystem.config.js')
    await fs.copyFile('./dockerfile-hd', buildDir + 'dockerfile-hd')
    await fs.copyFile('./dockerfile-wfs', buildDir + 'dockerfile-wfs')
    await fs.copy('./app/Services/Warp10Templates', buildDir + '/app/Services/Warp10Templates')
    await fs.copy('./bin', buildDir + '/bin')
    await fs.copy('./resources/project_services', buildDir + '/resources/project_services')
  }
}
