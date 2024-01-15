module.exports = {
  apps: [
    {
      script: 'server.js',
      instances: 1,
      autorestart: true,
    },
    {
      script: 'node ace background',
      autorestart: true,
    },
    {
      script: 'node ace queue:listen',
      autorestart: true,
    },
    {
      script: 'node ace scheduler:run',
      autorestart: true,
    },
    {
      script: 'bin/erlenmeyer/run.js',
      name: "erlenmeyer",
      autorestart: true,
    },
    {
      script: 'bin/telegraf/run.js',
      name: "telegraf",
      autorestart: true,
    },
  ],
}
