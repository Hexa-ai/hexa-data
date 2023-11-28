const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

// Path to the .env file in the parent directory
const envFilePath = path.join(__dirname, '../../.env')

// Load environment variables from the .env file
require('dotenv').config({ path: envFilePath })

// Content for the config.yml file
const configContent = `warp_endpoint: ${process.env.WARP10_ENDPOINT}
listen: ${process.env.ERLENMEYER_ENDPOINT}`

// Path to the config.yml file
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
const erlenmeyerProcess = spawn(path.join(__dirname, 'erlenmeyer'), ['--config', path.join(__dirname, 'config.yml')], { stdio: 'inherit' })

// Handle exit events of the child process
erlenmeyerProcess.on('exit', (code, signal) => {
  if (code === 0) {
    console.log('The erlenmeyer script has exited successfully.')
  } else {
    console.error(`The erlenmeyer script exited with error code ${code}.`)
  }
})
