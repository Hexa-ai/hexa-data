import fetch from 'node-fetch'
import tar from 'tar-stream'

class DockerManager {
  private ip: string
  private port: number

  constructor(ip?: string, port?: number) {
    this.ip = ip || process.env.VITE_DOCKER_HOST_IP || '127.0.0.1'
    this.port = port || parseInt(process.env.VITE_DOCKER_HOST_PORT || '2375', 10)
  }

  private async fetchWrapper(url: string, options: RequestInit = {}) {
    const response = await fetch(url, options)
    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
    }
    return response
  }

  private buildUrl(path: string, queryParams: Record<string, string | number | boolean> = {}) {
    const query = new URLSearchParams(queryParams as any).toString()
    return `http://${this.ip}:${this.port}${path}${query ? `?${query}` : ''}`
  }

  async imageExists(name: string) {
    const url = this.buildUrl('/images/json')
    try {
      const response = await this.fetchWrapper(url)
      const images = await response.json()
      return images.some((image: any) => image.RepoTags && image.RepoTags.includes(name))
    } catch (error) {
      console.error(`Error checking if image ${name} exists:`, error)
      throw error
    }
  }

  async pullImage(name: string) {
    const url = this.buildUrl('/images/create', { fromImage: name })
    try {
      await this.fetchWrapper(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      console.log(`Attempting to pull image ${name}...`)

      let imageAvailable = false
      const maxAttempts = 30
      const delayBetweenAttempts = 2000

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Checking if image is available [Attempt ${attempt}/${maxAttempts}]...`)
        imageAvailable = await this.imageExists(name)
        if (imageAvailable) {
          console.log(`Image ${name} is now available.`)
          break
        }
        await new Promise((resolve) => setTimeout(resolve, delayBetweenAttempts))
      }

      if (!imageAvailable) {
        throw new Error(`Image ${name} did not become available after ${maxAttempts} attempts.`)
      }
    } catch (error) {
      console.error(`Error pulling image ${name}:`, error)
      throw error
    }
  }

  async ensureImageExists(name: string) {
    const exists = await this.imageExists(name)
    if (!exists) {
      await this.pullImage(name)
    }
  }

  async createContainer(name: string, options: any) {
    const url = this.buildUrl('/containers/create', { name })
    try {
      const response = await this.fetchWrapper(url, {
        method: 'POST',
        body: JSON.stringify(options),
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      console.log(`Container ${data.Id} created successfully.`)
      return data.Id
    } catch (error) {
      console.error('Error creating container:', error)
      throw error
    }
  }

  async listContainers(options: { all?: boolean } = {}) {
    const url = this.buildUrl('/containers/json', { all: options.all ?? true })
    try {
      const response = await this.fetchWrapper(url)
      const containers = await response.json()
      console.log('Containers:', containers)
      return containers
    } catch (error) {
      console.error('Error listing containers:', error)
      throw error
    }
  }

  async deleteContainer(id: string) {
    const url = this.buildUrl(`/containers/${id}`, { force: true })
    try {
      await this.fetchWrapper(url, { method: 'DELETE' })
      console.log(`Container ${id} deleted`)
    } catch (error) {
      console.error(`Error deleting container ${id}:`, error)
      throw error
    }
  }

  async startContainer(id: string) {
    const url = this.buildUrl(`/containers/${id}/start`)
    try {
      await this.fetchWrapper(url, { method: 'POST' })
      console.log(`Container ${id} started successfully.`)
    } catch (error) {
      console.error(`Error starting container ${id}:`, error)
      throw error
    }
  }

  async stopContainer(id) {
    const url = this.buildUrl(`/containers/${id}/stop`)

    try {
      await this.fetchWrapper(url, { method: 'POST' })
      console.log(`Container ${id} stopped successfully.`)
    } catch (error) {
      console.error(`Error stopping container ${id}:`, error)
      throw error
    }
  }

  async restartContainer(id) {
    const url = this.buildUrl(`/containers/${id}/restart`)

    try {
      await this.fetchWrapper(url, { method: 'POST' })
      console.log(`Container ${id} restarted successfully.`)
    } catch (error) {
      console.error(`Error restarting container ${id}:`, error)
      throw error
    }
  }

  async getContainerLogs(id) {
    const url = this.buildUrl(`/containers/${id}/logs?stdout=true&stderr=true&tail=500`)

    try {
      const response = await this.fetchWrapper(url, { method: 'GET' })
      const buffer = await response.buffer()
      let logs = ''
      let pos = 0

      while (pos < buffer.length) {
        const size = buffer.readInt32BE(pos + 4)
        pos += 8
        logs += buffer.toString('utf8', pos, pos + size)
        pos += size
      }

      return logs
    } catch (error) {
      console.error(`Error getting logs for container ${id}:`, error)
      throw error
    }
  }

  async execCommand(containerId, command, withPrivileges = false) {
    let execId
    try {
      const execUrl = this.buildUrl(`/containers/${containerId}/exec`)
      const execResponse = await this.fetchWrapper(execUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          AttachStdout: true,
          AttachStderr: true,
          Cmd: command.split(' '),
          Privileged: withPrivileges,
        }),
      })
      const execData = await execResponse.json()
      execId = execData.Id
    } catch (error) {
      console.error('Error creating exec instance:', error)
      throw error
    }

    try {
      const startUrl = this.buildUrl(`/exec/${execId}/start`)
      const startResponse = await this.fetchWrapper(startUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Detach: false, Tty: false }),
      })

      const buffer = await startResponse.buffer()
      let result = ''
      let pos = 0

      while (pos < buffer.length) {
        const size = buffer.readInt32BE(pos + 4)
        pos += 8
        result += buffer.toString('utf8', pos, pos + size)
        pos += size
      }

      return result
    } catch (error) {
      console.error('Error executing command:', error)
      throw error
    }
  }

  async findUnusedPort({ from = 8000, to = 9000 } = {}) {
    const url = this.buildUrl('/containers/json')
    try {
      const response = await this.fetchWrapper(url)
      const containers = await response.json()
      const usedPorts = new Set(
        containers.flatMap((container: any) =>
          container.Ports.filter((port: any) => port.PublicPort).map((port: any) => port.PublicPort)
        )
      )

      for (let port = from; port <= to; port++) {
        if (!usedPorts.has(port)) {
          console.log(`Found unused port: ${port}`)
          return port
        }
      }

      throw new Error('No unused port found in the specified range.')
    } catch (error) {
      console.error(`Error finding unused port:`, error)
      throw error
    }
  }

  async createVolume(options: any) {
    const url = this.buildUrl('/volumes/create')
    try {
      const response = await this.fetchWrapper(url, {
        method: 'POST',
        body: JSON.stringify(options),
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      console.log(`Volume ${data.Name} created successfully.`)
      return true
    } catch (error) {
      console.error(`Error creating volume:`, error)
      throw error
    }
  }

  async deleteVolume(name: string) {
    const url = this.buildUrl(`/volumes/${name}`)
    try {
      await this.fetchWrapper(url, { method: 'DELETE' })
      console.log(`Volume ${name} deleted successfully.`)
    } catch (error) {
      console.error(`Error deleting volume ${name}:`, error)
      throw error
    }
  }

  async findContainersByLabel(labelKey: string, labelValue: string) {
    const filters = encodeURIComponent(JSON.stringify({ label: [`${labelKey}=${labelValue}`] }))
    const url = this.buildUrl('/containers/json', { filters })
    try {
      const response = await this.fetchWrapper(url)
      const containers = await response.json()
      return containers.map((container: any) => container.Id)
    } catch (error) {
      console.error(`Error finding containers by label:`, error)
      throw error
    }
  }

  async findVolumesByLabel(labelKey: string, labelValue: string) {
    const filters = encodeURIComponent(JSON.stringify({ label: [`${labelKey}=${labelValue}`] }))
    const url = this.buildUrl('/volumes', { filters })
    try {
      const response = await this.fetchWrapper(url)
      const volumesData = await response.json()
      return volumesData.Volumes ? volumesData.Volumes.map((volume: any) => volume.Name) : []
    } catch (error) {
      console.error(`Error finding volumes by label:`, error)
      throw error
    }
  }

  async findContainerByName(containerName: string) {
    const url = this.buildUrl('/containers/json', { all: true })
    try {
      const response = await this.fetchWrapper(url)
      const containers = await response.json()
      const foundContainer = containers.find((container: any) =>
        container.Names.some((name: string) => name === `/${containerName}`)
      )
      return foundContainer ? foundContainer.Id : null
    } catch (error) {
      console.error(`Error finding container by name:`, error)
      throw error
    }
  }

  async findVolumeByName(volumeName: string) {
    const url = this.buildUrl('/volumes')
    try {
      const response = await this.fetchWrapper(url)
      const volumesData = await response.json()
      const foundVolume = volumesData.Volumes
        ? volumesData.Volumes.find((volume: any) => volume.Name === volumeName)
        : null
      return foundVolume ? foundVolume.Name : null
    } catch (error) {
      console.error(`Error finding volume by name:`, error)
      throw error
    }
  }

  async getContainerStats(containerId: string) {
    const url = this.buildUrl(`/containers/${containerId}/stats`, { stream: false })
    try {
      const response = await this.fetchWrapper(url)
      const stats = await response.json()
      return stats
    } catch (error) {
      console.error(`Error getting stats for container ${containerId}:`, error)
      throw error
    }
  }

  async uploadFile(containerId, name, content, path) {
    const pack = tar.pack()
    pack.entry({ name }, content)
    pack.finalize()

    // Construire l'URL pour l'API Docker
    const url = this.buildUrl(`/containers/${containerId}/archive?path=${encodeURIComponent(path)}`)

    try {
      const response = await this.fetchWrapper(url, {
        method: 'PUT',
        body: pack, // Le corps de la requête est le fichier tar
        headers: { 'Content-Type': 'application/x-tar' },
      })

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`)
      }

      console.log(`File uploaded to ${containerId}:${path} successfully.`)
    } catch (error) {
      console.error('Error uploading file to container:', error)
      throw error
    }
  }
}

export { DockerManager }
