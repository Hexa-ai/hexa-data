import Dashboard from 'App/Modules/Datas/Models/Dashboard'
import Tag from 'App/Modules/Datas/Models/Tag'

export default class RefactorWs {
  public async handle(payload: any) {
    console.log(payload)
    const macros = await Tag.query().where('project_id', payload.projectId).andWhere('type', 3)
    for (const i in macros) {
      if (macros[i].script!=null){
        macros[i].script=macros[i].script.replace('@project/'+payload.oldTagName, '@project/'+payload.tagName)
        await macros[i].save()
      }

    }

    const dashboards = await Dashboard.query().where('project_id', payload.projectId)
    for (const i in dashboards) {
      if ( dashboards[i].body!=null){
        dashboards[i].body=dashboards[i].body.replace('@project/'+payload.oldTagName, '@project/'+payload.tagName)
        await dashboards[i].save()
      }
    }
  }
}
