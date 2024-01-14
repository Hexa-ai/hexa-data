import Project from 'App/Modules/Projects/Models/Project'
import Redis from '@ioc:Adonis/Addons/Redis'

export default class TelegrafService {
  constructor() {}

  public async updateProjectConfig(project: Project) {
    await Redis.publish(
      'hd:bin:telegraf:update_project',
      JSON.stringify({
        uuid: project.uuid,
        token: project.writeToken,
      })
    )
  }

  public async removeProjectConfig(project: Project) {
    await Redis.publish(
      'hd:bin:telegraf:remove_project',
      JSON.stringify({
        uuid: project.uuid,
      })
    )
  }

  public static handleRedisMessages() {
    Redis.subscribe('hd:bin:telegraf:pull_projects', async () => {
      Redis.publish(
        'hd:bin:telegraf:push_projects',
        JSON.stringify(
          (await Project.all()).map((project) => {
            return {
              uuid: project.uuid,
              token: project.writeToken,
            }
          })
        )
      )
    })
  }
}
