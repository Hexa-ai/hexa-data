import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import Project from '../Models/Project'
import fs from 'fs/promises'
import { ProjectService } from '../Services/ProjectService'
import GrafanaService from 'App/Services/GrafanaService'
import Role from '../Contracts/enums/Roles'

export default class ServiceGrafanaController {
  public async update({ params, bouncer, request }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('manageGrafanaService')
    const project = await Project.findOrFail(params.id)
    const grafanaEnabled = request.input('grafanaEnabled')
    const grafanaMode = request.input('grafanaMode')
    let grafanaUrl = request.input('grafanaUrl')
    let grafanaDockerHost = request.input('grafanaDockerHost')
    if (!grafanaDockerHost) grafanaDockerHost = project.grafanaDockerHost
    if (!grafanaDockerHost) grafanaDockerHost = Env.get('VITE_GRAFANA_DOCKER_HOST')
    let grafanaDockerPort = request.input('grafanaDockerPort')
    if (!grafanaDockerPort) grafanaDockerPort = project.grafanaDockerPort
    if (!grafanaDockerPort) grafanaDockerPort = Env.get('VITE_GRAFANA_DOCKER_PORT')
    let grafanaVersion = request.input('grafanaVersion') || Env.get('VITE_DOCKER_GRAFANA_VERSION')
    let grafanaConfiguration = request.input('grafanaConfiguration')
    let grafanaReaderPassword = request.input('grafanaReaderPassword')
    let grafanaWriterPassword = request.input('grafanaWriterPassword')

    const projectService = new ProjectService(project, grafanaDockerHost, grafanaDockerPort)

    // If grafana managed mode is enabled
    if (grafanaEnabled && grafanaMode === 'MANAGED') {
      /*
       * Create or update the docker container
       */
      const { port } = await projectService.deployGrafana({
        adminUser: Env.get('DOCKER_GRAFANA_ADMIN_USER'),
        adminPassword: Env.get('DOCKER_GRAFANA_ADMIN_PASSWORD'),
        config: grafanaConfiguration,
        version: grafanaVersion,
      })

      // Save new container created
      project.grafanaEnabled = grafanaEnabled
      project.grafanaMode = grafanaMode
      project.grafanaUrl = `http://${grafanaDockerHost}:${port}`
      project.grafanaVersion = grafanaVersion
      project.grafanaConfiguration = grafanaConfiguration
      project.grafanaDockerHost = grafanaDockerHost
      project.grafanaDockerPort = grafanaDockerPort
      await project.save()

      /*
       * Configure the grafana instance
       */
      const grafanaService = new GrafanaService(
        project.grafanaUrl,
        Env.get('DOCKER_GRAFANA_ADMIN_USER'),
        Env.get('DOCKER_GRAFANA_ADMIN_PASSWORD')
      )

      await grafanaService.waitForAvailability(10)
      project.grafanaReaderPassword = await grafanaService.configureReader(grafanaReaderPassword)
      project.grafanaWriterPassword = await grafanaService.configureWriter(grafanaWriterPassword)
      await project.save()
    }
    // If grafana managed mode is disabled
    else {
      // And if it is a deletion (grafana was enabled and managed before), remove the docker container
      if (project.grafanaEnabled && project.grafanaMode === 'MANAGED') {
        await projectService.removeGrafana()
      }

      project.grafanaEnabled = grafanaEnabled
      project.grafanaMode = grafanaEnabled ? grafanaMode : null
      project.grafanaUrl = grafanaEnabled ? grafanaUrl : null
      project.grafanaVersion = null
      project.grafanaConfiguration = null
      project.grafanaDockerHost = null
      project.grafanaDockerPort = null
      project.grafanaReaderPassword = null
      project.grafanaWriterPassword = null
      await project.save()
    }
  }

  public async getDefaultConfig({ bouncer }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('manageGrafanaService')
    return {
      config: await fs.readFile('./resources/project_services/config/grafana.ini', 'utf-8'),
    }
  }

  public async getAuthCookies({ params, bouncer, response, auth }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('getGrafanaCookies', params.id)
    const project = await Project.findOrFail(params.id)

    if (auth.user && project.grafanaEnabled && project.grafanaMode === 'MANAGED') {
      const grafanaService = new GrafanaService(
        project.grafanaUrl,
        Env.get('DOCKER_GRAFANA_ADMIN_USER'),
        Env.get('DOCKER_GRAFANA_ADMIN_PASSWORD')
      )

      await grafanaService.configureOrg()

      if (auth.user.isAdmin) {
        return await grafanaService.getAdminCookies()
      } else if (await auth.user.hasProjectRights(project.id, Role.EDITOR)) {
        return await grafanaService.getWriterCookies(project.grafanaWriterPassword)
      } else {
        return await grafanaService.getReaderCookies(project.grafanaReaderPassword)
      }
    }

    // Return a 400 error if no user or the dashboard type is not GRAFANA
    return response.status(400)
  }

  public async getStatus({ bouncer, params, response }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('manageGrafanaService')
    const project = await Project.findOrFail(params.id)
    const projectService = new ProjectService(
      project,
      project.grafanaDockerHost,
      project.grafanaDockerPort
    )

    // Retrieve statistics about the container
    const id = await projectService.docker.findContainerByName('c_grafana_' + project.id)
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
    await bouncer.with('ProjectPolicy').authorize('manageGrafanaService')
    const project = await Project.findOrFail(params.id)
    const projectService = new ProjectService(
      project,
      project.grafanaDockerHost,
      project.grafanaDockerPort
    )
    const id = await projectService.docker.findContainerByName('c_grafana_' + project.id)
    return {
      output: await projectService.docker.execCommand(
        id,
        request.input('command'),
        request.input('adminUser')
      ),
    }
  }

  public async start({ bouncer, params }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('manageGrafanaService')
    const project = await Project.findOrFail(params.id)
    const projectService = new ProjectService(
      project,
      project.grafanaDockerHost,
      project.grafanaDockerPort
    )
    const id = await projectService.docker.findContainerByName('c_grafana_' + project.id)
    projectService.docker.startContainer(id)
  }

  public async stop({ bouncer, params }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('manageGrafanaService')
    const project = await Project.findOrFail(params.id)
    const projectService = new ProjectService(
      project,
      project.grafanaDockerHost,
      project.grafanaDockerPort
    )
    const id = await projectService.docker.findContainerByName('c_grafana_' + project.id)
    projectService.docker.stopContainer(id)
  }

  public async restart({ bouncer, params }: HttpContextContract) {
    await bouncer.with('ProjectPolicy').authorize('manageGrafanaService')
    const project = await Project.findOrFail(params.id)
    const projectService = new ProjectService(
      project,
      project.grafanaDockerHost,
      project.grafanaDockerPort
    )
    const id = await projectService.docker.findContainerByName('c_grafana_' + project.id)
    projectService.docker.restartContainer(id)
  }
}
