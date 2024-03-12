/*
 * NodeRed configuration file
 * This file has default credentials used by hexa-data, you can add credentials and other configurations here.
 * Please see https://nodered.org/docs/user-guide/runtime/configuration/ for possible configuration options
 */
module.exports = {
  adminAuth: {
    type: "credentials",
    users: [{
      username: "${ADMIN_USER}",
      password: "${ADMIN_PASSWORD_HASH}",
      permissions: "*"
    }, {
      username: "${WRITER_USER}",
      password: "${WRITER_PASSWORD_HASH}",
      permissions: "*"
    }]
  }
}