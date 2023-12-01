const path = require('path')
const fs = require('fs').promises
const { spawn } = require('child_process')
const { createClient } = require('redis')

require('dotenv').config({ path: path.join(__dirname, '../../.env') })

// Start Telegraf process
const telegrafProcess = spawn(path.join(__dirname, 'telegraf'), [
  '--config-directory',
  path.join(__dirname, 'conf.d'),
])

telegrafProcess.on('spawn', () => console.log('[TELEGRAF] Process started successfully.'))

// Process Telegraf's output
telegrafProcess.stdout.on('data', (data) => {
  data
    .toString()
    .split('\n')
    .forEach((line) => {
      if (line !== '') console.log('[TELEGRAF]', line)
    })
})

// Process Telegraf's error output
telegrafProcess.stderr.on('data', (data) => {
  data
    .toString()
    .split('\n')
    .forEach((line) => {
      if (line !== '') console.error('[TELEGRAF]', line)
    })
})

// Log Telegraf process closure
telegrafProcess.on('close', (code) => {
  console.log('[TELEGRAF]', 'Process ended with exit code', code)
})

// Update individual project configuration
const updateProjectConfig = async (uuid, token) => {
  const configContent = (await fs.readFile(path.join(__dirname, './config_template.conf'), 'utf8'))
    .replace(/\$\{(\w+)\}/g, (_, name) => (name in process.env ? process.env[name] : _))
    .replace(/\${PROJECT_UUID}/g, uuid)
    .replace(/\${PROJECT_TOKEN}/g, token)
    .replace(/\${_MQTT_ENDPOINT_TCP}/g, process.env.MQTT_ENDPOINT.replace('http://', 'tcp://'))

  try {
    await fs.writeFile(path.join(__dirname, 'conf.d', `${uuid}.conf`), configContent)
    console.log('[RUN]', 'The config file', uuid, '.conf has been updated.')
  } catch (err) {
    console.error('[RUN]', 'Error updating file', uuid, '.conf', err)
  }
}

// Remove specific project configuration
const removeProjectConfig = async (uuid) => {
  try {
    await fs.unlink(path.join(__dirname, 'conf.d', `${uuid}.conf`))
    console.log('[RUN]', 'The config file', uuid, '.conf has been removed.')
  } catch (err) {
    console.error('[RUN]', 'Error removing file', uuid, '.conf', err)
  }
}

// Remove all project configurations
const removeAllProjectConfigs = async () => {
  const files = await fs.readdir(path.join(__dirname, 'conf.d'))
  for (const file of files) {
    try {
      await fs.unlink(path.join(__dirname, 'conf.d', file))
    } catch (err) {
      console.error('[RUN]', 'Error removing file', file, err)
    }
  }
  console.log('[RUN]', 'All config files were removed.')
}

// Debounce timer for Telegraf restart
let debounceTimer = null
const restartTelegraf = async () => {
  clearTimeout(debounceTimer)
  console.log('[RUN]', '(debounce) Scheduling SIGHUP message to telegraf process in 5 seconds.')
  debounceTimer = setTimeout(() => telegrafProcess.kill('SIGHUP'), 5000)
}

// Initialize Redis clients and subscribe to channels
;(async () => {
  const subClient = createClient({
    url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  }).on('error', (err) => console.log('[REDIS]', 'Sub client Error', err))

  const pubClient = createClient({
    url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  }).on('error', (err) => console.log('[REDIS]', 'Pub client Error', err))

  await subClient.connect()
  await pubClient.connect()
  console.log('[REDIS]', 'Clients Connected.')

  subClient.subscribe('hd:bin:telegraf:update_project', async (data) => {
    console.log('[REDIS]', 'Received message hd:bin:telegraf:update_project:', data)
    const { uuid, token } = JSON.parse(data)
    await updateProjectConfig(uuid, token)
    await restartTelegraf()
  })

  subClient.subscribe('hd:bin:telegraf:remove_project', async (data) => {
    console.log('[REDIS]', 'Received message hd:bin:telegraf:remove_project:', data)
    const { uuid } = JSON.parse(data)
    await removeProjectConfig(uuid)
    await restartTelegraf()
  })

  subClient.subscribe('hd:bin:telegraf:push_projects', async (data) => {
    console.log('[REDIS]', 'Received message hd:bin:telegraf:push_projects:', data)
    const projects = JSON.parse(data)
    await removeAllProjectConfigs()
    projects.forEach(async ({ uuid, token }) => await updateProjectConfig(uuid, token))
    await restartTelegraf()
  })

  pubClient.publish('hd:bin:telegraf:pull_projects', '')
})()