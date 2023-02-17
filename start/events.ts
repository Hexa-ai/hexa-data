import Event from '@ioc:Adonis/Core/Event'
import { Queue } from '@ioc:Setten/Queue'

Event.on('new:user', async (user) => {
  await Queue.dispatch('App/Jobs/SendNotifMailWelcome', user)
  await Queue.dispatch('App/Jobs/SendNotifMailAdmin', user)
})

Event.on('new:invitation', async ({ user, project }) => {
  await Queue.dispatch('App/Jobs/SendNotifMailAttchProj', { user, project })
})

Event.on('send:report', async (data) => {
  await Queue.dispatch('App/Jobs/GenerateReport', data)
})
