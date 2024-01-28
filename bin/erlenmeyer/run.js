const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

require('dotenv').config({ path: path.join(__dirname, '../../.env') })

// Load the configuration template and replace the environment variables
const configContent = fs
  .readFileSync(path.join(__dirname, './config_template.yml'), 'utf8')
  .replace(/\$\{(\w+)\}/g, (match, name) => {
    return name in process.env ? process.env[name] : match
  })

const configFilePath = path.join(__dirname, 'config.yml')

// Check if the config.yml file exists, replace it if it does, otherwise create it
if (fs.existsSync(configFilePath)) {
  fs.writeFileSync(configFilePath, configContent)
  console.log(`The file ${configFilePath} has been updated.`)
} else {
  fs.writeFileSync(configFilePath, configContent)
  console.log(`The file ${configFilePath} has been created.`)
}

// Execute the erlenmeyer script as a child process
const erlenmeyerProcess = spawn(
  path.join(__dirname, 'erlenmeyer'),
  ['--config', path.join(__dirname, 'config.yml')],
  { stdio: 'inherit' }
)

// Handle exit events of the child process
erlenmeyerProcess.on('exit', (code, signal) => {
  if (code === 0) {
    console.log('The erlenmeyer script has exited successfully.')
  } else {
    console.error(`The erlenmeyer script exited with error code ${code}.`)
  }
})