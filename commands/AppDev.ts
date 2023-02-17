import { BaseCommand } from '@adonisjs/core/build/standalone'
import fs from 'fs-extra'
import execaUtils from '../app/Utils/execaUtils'

export default class AppDev extends BaseCommand {
  public static commandName = 'app:dev'
  public static description = 'Unified Adonis & Vite dev mode'

  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  public async run() {
    this.logger.info('Starting servers')

    this.logger.info('Init Storage Dir')

    const importDir = './storage/import'
    const exportDir = './storage/export'
    const projectsPhotosDir = './storage/projectsPhotos'
    const appFilesDir = './storage/appFiles'
    const usersPhotosDir = './storage/usersPhotos'

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

    const adonisDev = execaUtils.execute('npm', ['run', 'dev:adonis'])
    const viteDev = execaUtils.execute('npm', ['run', 'dev:vite'])

    await Promise.all([adonisDev, viteDev])
  }
}
