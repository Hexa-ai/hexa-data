const { exec } = require('child_process')
const fs = require('fs').promises
const path = require('path')

// Retrieve the argument passed to the script
const telegrafBuilderPath = process.argv[2]

if (!telegrafBuilderPath) {
  console.error(
    'Error: The first parameter is required and should the absolute path where your Telegraf custom builder is. Please follow the instructions at this url : https://docs.influxdata.com/telegraf/v1/install/#custom-compile-telegraf'
  )
  process.exit(1)
}

// Get the directory where the script is running
const currentDir = path.resolve(__dirname)

// Construct the command
const command = `./tools/custom_builder/custom_builder --config ${currentDir}/config_template.conf`

const copyTelegrafFile = async () => {
  try {
    const sourceFile = path.join(telegrafBuilderPath, 'telegraf')
    const destinationFile = path.join(__dirname, 'telegraf')
    await fs.copyFile(sourceFile, destinationFile)
    console.log('Telegraf file copied successfully')
  } catch (err) {
    console.error('Error copying the telegraf file:', err)
  }
}

// Execute the command
exec(command, { cwd: telegrafBuilderPath }, async (error, stdout, stderr) => {
  console.log(stdout, stderr)
  await copyTelegrafFile()
})
