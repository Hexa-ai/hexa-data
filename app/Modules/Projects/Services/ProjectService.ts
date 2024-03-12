import Project from '../Models/Project'
import { DockerManager } from './DockerManager'
import bcrypt from 'bcrypt'

class ProjectService {
  private project: Project
  public docker: DockerManager

  constructor(project: Project, ip, port) {
    this.project = project
    this.docker = new DockerManager(ip, port)
  }

  async deployGrafana({ adminPassword, adminUser, config, version }) {
    const image = 'grafana/grafana-oss:' + version
    const containerName = 'c_grafana_' + this.project.id
    const volumeName = 'v_grafana_' + this.project.id
    await this.docker.ensureImageExists(image)

    // Remove the container if it already exists
    const existingContainer = await this.docker.findContainerByName(containerName)
    if (existingContainer) {
      await this.docker.deleteContainer(existingContainer)
    }

    // Create the volume if it doesn't exist
    const existingVolume = await this.docker.findVolumeByName(volumeName)
    if (!existingVolume) {
      await this.docker.createVolume({
        Name: volumeName,
        Labels: {
          project: this.project.id.toString(),
        },
      })
    }

    // Retrieve an available port and create the container
    const unusedPort = await this.docker.findUnusedPort()
    const id = await this.docker.createContainer(containerName, {
      Image: image,
      ExposedPorts: {
        '3000/tcp': {},
      },
      HostConfig: {
        PortBindings: {
          '3000/tcp': [
            {
              HostPort: unusedPort.toString(),
            },
          ],
        },
        Mounts: [
          {
            Type: 'volume',
            Source: volumeName,
            Target: '/var/lib/grafana',
          },
        ],
      },
      Env: [
        `GF_SECURITY_ADMIN_PASSWORD=${adminPassword}`,
        `GF_SECURITY_ADMIN_USER=${adminUser}`,
        'GF_SECURITY_ALLOW_EMBEDDING=true',
      ],
      Labels: {
        project: this.project.id.toString(),
        type: 'grafana',
      },
    })

    // Start it, upload the configuration and restart it
    await this.docker.startContainer(id)
    await this.docker.uploadFile(id, 'grafana.ini', config, '/etc/grafana')
    await this.docker.restartContainer(id)

    return { id, port: unusedPort }
  }

  async removeGrafana() {
    const container = await this.docker.findContainerByName('c_grafana_' + this.project.id)
    if (container) {
      await this.docker.deleteContainer(container)
    }

    const volume = await this.docker.findVolumeByName('v_grafana_' + this.project.id)
    if (volume) {
      await this.docker.deleteVolume(volume)
    }
  }

  async deployNodeRed({ adminPassword, adminUser, writerUser, writerPassword, config, version }) {
    const image = 'nodered/node-red:' + version
    const containerName = 'c_nodered_' + this.project.id
    const volumeName = 'v_nodered_' + this.project.id
    await this.docker.ensureImageExists(image)

    // Remove the container if it already exists
    const existingContainer = await this.docker.findContainerByName(containerName)
    if (existingContainer) {
      await this.docker.deleteContainer(existingContainer)
    }

    // Create the volume if it doesn't exist
    const existingVolume = await this.docker.findVolumeByName(volumeName)
    if (!existingVolume) {
      await this.docker.createVolume({
        Name: volumeName,
        Labels: {
          project: this.project.id.toString(),
        },
      })
    }

    // Retrieve an available port and create the container
    const unusedPort = await this.docker.findUnusedPort()
    const id = await this.docker.createContainer(containerName, {
      Image: image,
      ExposedPorts: {
        '1880/tcp': {},
      },
      HostConfig: {
        PortBindings: {
          '1880/tcp': [
            {
              HostPort: unusedPort.toString(),
            },
          ],
        },
        Mounts: [
          {
            Type: 'volume',
            Source: volumeName,
            Target: '/data',
          },
        ],
      },
      Labels: {
        project: this.project.id.toString(),
        type: 'nodered',
      },
    })

    // Start it, upload the configuration and restart it
    await this.docker.startContainer(id)

    // Replace ${ADMIN_USER} by adminUser, and replace ${ADMIN_PASSWORD_HASH} by hash of adminPassword
    config = config.replace('${ADMIN_USER}', adminUser)
    config = config.replace('${ADMIN_PASSWORD_HASH}', await bcrypt.hash(adminPassword, 10))
    config = config.replace('${WRITER_USER}', writerUser)
    config = config.replace('${WRITER_PASSWORD_HASH}', await bcrypt.hash(writerPassword, 10))
    await this.docker.uploadFile(id, 'settings.js', config, '/data')
    await this.docker.restartContainer(id)

    return { id, port: unusedPort }
  }

  async removeNodeRed() {
    const container = await this.docker.findContainerByName('c_nodered_' + this.project.id)
    if (container) {
      await this.docker.deleteContainer(container)
    }

    const volume = await this.docker.findVolumeByName('v_nodered_' + this.project.id)
    if (volume) {
      await this.docker.deleteVolume(volume)
    }
  }
}

export { ProjectService }
