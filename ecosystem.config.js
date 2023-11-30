module.exports = {
  apps: [
    {
      script: 'server.js',
      instances: 1,
      autorestart: true,
    },
    {
      script: 'node ace mqtt:sub',
      instances: 2,
      autorestart: true,
    },
    {
      script: 'node ace queue:listen',
      autorestart: true,
    },
    {
      script: 'node ace scripts:start',
      autorestart: true,
    },
    {
      script: 'node ace scheduler:run',
      autorestart: true,
    },
    {
      script: 'bin/erlenmeyer/run.js',
      instances: 1,
      autorestart: true,
    },
  ],
}
