import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import Project from '../Models/Project'
import fs from 'fs/promises'
import { ProjectService } from '../Services/ProjectService'

const generatePassword = (length) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }

  return password
}

export default class ServiceNodeRedController {
  public async update({ params, bouncer, request }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('manageNodeRedService')
    const project = await Project.findOrFail(params.id)
    const nodeRedEnabled = request.input('nodeRedEnabled')
    const nodeRedMode = request.input('nodeRedMode')
    let nodeRedUrl = request.input('nodeRedUrl')
    let nodeRedDockerHost = request.input('nodeRedDockerHost')
    if (!nodeRedDockerHost) nodeRedDockerHost = project.nodeRedDockerHost
    if (!nodeRedDockerHost) nodeRedDockerHost = Env.get('VITE_NODE_RED_DOCKER_HOST')
    let nodeRedDockerPort = request.input('nodeRedDockerPort')
    if (!nodeRedDockerPort) nodeRedDockerPort = project.nodeRedDockerPort
    if (!nodeRedDockerPort) nodeRedDockerPort = Env.get('VITE_NODE_RED_DOCKER_PORT')
    let nodeRedVersion = request.input('nodeRedVersion') || Env.get('VITE_DOCKER_NODERED_VERSION')
    let nodeRedConfiguration = request.input('nodeRedConfiguration')
    const nodeRedWriterPassword = request.input('nodeRedWriterPassword') || generatePassword(20)

    const projectService = new ProjectService(project, nodeRedDockerHost, nodeRedDockerPort)

    // If node red managed mode is enabled
    if (nodeRedEnabled && nodeRedMode === 'MANAGED') {
      /*
       * Create or update the docker container
       */
      const { url } = await projectService.deployNodeRed({
        adminUser: Env.get('DOCKER_NODERED_ADMIN_USER'),
        adminPassword: Env.get('DOCKER_NODERED_ADMIN_PASSWORD'),
        writerUser: Env.get('VITE_DOCKER_NODERED_WRITE_USER'),
        writerPassword: nodeRedWriterPassword,
        config: nodeRedConfiguration,
        version: nodeRedVersion,
      })

      // Save new container created
      project.nodeRedEnabled = nodeRedEnabled
      project.nodeRedMode = nodeRedMode
      project.nodeRedUrl = url
      project.nodeRedVersion = nodeRedVersion
      project.nodeRedConfiguration = nodeRedConfiguration
      project.nodeRedDockerHost = nodeRedDockerHost
      project.nodeRedDockerPort = nodeRedDockerPort
      project.nodeRedWriterPassword = nodeRedWriterPassword
      await project.save()
    }
    // If node red managed mode is disabled
    else {
      // And if it is a deletion (node red was enabled and managed before), remove the docker container
      if (project.nodeRedEnabled && project.nodeRedMode === 'MANAGED') {
        await projectService.removeNodeRed()
      }

      project.nodeRedEnabled = nodeRedEnabled
      project.nodeRedMode = nodeRedEnabled ? nodeRedMode : null
      project.nodeRedUrl = nodeRedEnabled ? nodeRedUrl : null
      project.nodeRedVersion = null
      project.nodeRedConfiguration = null
      project.nodeRedDockerHost = null
      project.nodeRedDockerPort = null
      project.nodeRedWriterPassword = null
      await project.save()
    }
  }

  public async getDefaultConfig({ bouncer }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('manageNodeRedService')
    return {
      config: await fs.readFile('./resources/project_services/config/settings.js', 'utf-8'),
    }
  }

  public async getStatus({ bouncer, params, response }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('manageNodeRedService')
    const project = await Project.findOrFail(params.id)
    const projectService = new ProjectService(
      project,
      project.nodeRedDockerHost,
      project.nodeRedDockerPort
    )

    // Retrieve statistics about the container
    const id = await projectService.docker.findContainerByName('c_nodered_' + project.id)
    const stats = await projectService.docker.getContainerStats(id)
    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage
    const systemCpuDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage
    const cpuUsagePercentage =
      ((cpuDelta / systemCpuDelta) * stats.cpu_stats.online_cpus * 100).toFixed(2) + '%'
    const memoryUsagePercentage =
      ((stats.memory_stats.usage / stats.memory_stats.limit) * 100).toFixed(2) + '%'
    const networks = stats.networks.eth0
    const netInputKb = (networks.rx_bytes / 1024).toFixed(1) + 'kB'
    const netOutputKb = (networks.tx_bytes / 1024).toFixed(1) + 'kB'
    const blockInputBytes = stats.blkio_stats.io_service_bytes_recursive
      .filter((stat) => stat.op === 'read')
      .reduce((acc, curr) => acc + curr.value, 0)
    const blockOutputBytes = stats.blkio_stats.io_service_bytes_recursive
      .filter((stat) => stat.op === 'write')
      .reduce((acc, curr) => acc + curr.value, 0)
    const blockInputMb = (blockInputBytes / 1024 / 1024).toFixed(2) + 'MB'
    const blockOutputMb = (blockOutputBytes / 1024 / 1024).toFixed(2) + 'MB'
    const pids = stats.pids_stats.current

    // Retrieve the logs
    let logs = await projectService.docker.getContainerLogs(id)

    response.send({
      logs,
      stats: {
        cpu: cpuUsagePercentage,
        memory: memoryUsagePercentage,
        net: {
          i: netInputKb,
          o: netOutputKb,
        },
        block: {
          i: blockInputMb,
          o: blockOutputMb,
        },
        pids: pids,
      },
    })
  }

  public async execCommand({ bouncer, params, request }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('manageNodeRedService')
    const project = await Project.findOrFail(params.id)
    const projectService = new ProjectService(
      project,
      project.nodeRedDockerHost,
      project.nodeRedDockerPort
    )
    const id = await projectService.docker.findContainerByName('c_nodered_' + project.id)
    return {
      output: await projectService.docker.execCommand(
        id,
        request.input('command'),
        request.input('adminUser')
      ),
    }
  }

  public async start({ bouncer, params }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('manageNodeRedService')
    const project = await Project.findOrFail(params.id)
    const projectService = new ProjectService(
      project,
      project.nodeRedDockerHost,
      project.nodeRedDockerPort
    )
    const id = await projectService.docker.findContainerByName('c_nodered_' + project.id)
    projectService.docker.startContainer(id)
  }

  public async stop({ bouncer, params }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('manageNodeRedService')
    const project = await Project.findOrFail(params.id)
    const projectService = new ProjectService(
      project,
      project.nodeRedDockerHost,
      project.nodeRedDockerPort
    )
    const id = await projectService.docker.findContainerByName('c_nodered_' + project.id)
    projectService.docker.stopContainer(id)
  }

  public async restart({ bouncer, params }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('manageNodeRedService')
    const project = await Project.findOrFail(params.id)
    const projectService = new ProjectService(
      project,
      project.nodeRedDockerHost,
      project.nodeRedDockerPort
    )
    const id = await projectService.docker.findContainerByName('c_nodered_' + project.id)
    projectService.docker.restartContainer(id)
  }
}
