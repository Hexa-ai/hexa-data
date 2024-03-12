<template>
  <dialog ref="refDialog" class="modal">
    <div class="modal-box w-11/12 max-w-7xl p-0 pb-16">
      <form method="dialog" class="absolute right-3 top-3" @click="closeDialog">
        <kbd class="kbd kbd-xs mr-1">esc</kbd>
        <button class="btn btn-sm btn-circle btn-ghost ">✕</button>
      </form>
      <h3 class="font-bold text-lg p-4">Gestion du conteneur Grafana</h3>

      <div v-if="dialog.offline" class="font-mono w-full px-5 bg-error text-white text-center">
        The container is offline, please run the "start" command
      </div>
      <div v-else class="font-mono flex justify-between w-full px-5 bg-primary text-white">
        <span>CPU % : {{ dialog.stats?.cpu }}</span>
        <span>MEM % : {{ dialog.stats?.memory }}</span>
        <span>NET I/O : {{ dialog.stats?.net?.i }} / {{ dialog.stats?.net?.o }}</span>
        <span>BLOCK I/O : {{ dialog.stats?.block?.i }} / {{ dialog.stats?.block?.o }}</span>
        <span>PIDS : {{ dialog.stats?.pids }}</span>
      </div>

      <div ref="dialogContainer" class="bg-surface-900 font-mono overflow-auto h-2/3 bg-surface-900 text-white"
        @click="onContentClick">
        <div v-show="dialog.tab === 'terminal'">
          <pre class="p-2 pb-0 overflow-auto whitespace-pre-wrap">{{ dialog.terminal.content }}</pre>
          <div v-show="!dialog.terminal.loading"
            :class="'flex items-center p-2 pt-0 bg-surface-900' + (dialog.terminal.adminUser ? ' text-warning' : '')">
            <label class="swap pr-2">
              <input type="checkbox" class="hidden" v-model="dialog.terminal.adminUser" />
              <div class="swap-off">$</div>
              <div class="swap-on">#</div>
            </label>
            <label class="input input-bordered flex items-center gap-2 input w-full bg-surface-900 pl-0 h-[25]">
              <input ref="terminalInput" class="flex-grow h-[25]" v-model="dialog.terminal.command"
                @keyup.enter="sendCommand(dialog.terminal.command)" />
              <span v-for="command in Object.keys(commands)" v-show="dialog.terminal.command === command" :key="command"
                class="text-gray-400">
                - {{ commands[command].description }}
              </span>
            </label>
          </div>
        </div>
        <div v-show="dialog.tab === 'logs'">
          <pre class="p-2 whitespace-pre-wrap">{{ dialog.logs || "No log content to show ..." }}</pre>
        </div>
      </div>

      <div class="btm-nav text-black">
        <button :class="dialog.tab === 'terminal' ? 'active' : ''" @click="dialog.tab = 'terminal'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <span class="btm-nav-label">Terminal Virtuel</span>
        </button>
        <button :class="dialog.tab === 'logs' ? 'active' : ''" @click="dialog.tab = 'logs'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span class="btm-nav-label">Logs</span>
        </button>
      </div>
    </div>
  </dialog>

  <div class="card card-bordered bg-base-100 shadow-md">
    <div class="card-body">
      <div class="flex justify-between items-center">
        <h2 class="card-title">Grafana</h2>
        <div class="flex items-center text-sm">
          <label class="label cursor-pointer">
            <input v-if="edit" :disabled="loading.enable" v-model="projectService.grafanaEnabled" @click="toggleEnabled"
              type="checkbox" class="checkbox checkbox-primary mr-2" />
            <span v-if="projectService.grafanaEnabled" class="text-primary-500 cursor-pointer font-bold">Activé</span>
            <span v-else class="text-gray-500 cursor-pointer'">Désactivé</span>
          </label>
        </div>
      </div>

      <div>Outil de visualisation et d'analyse permettant de créer des
        tableaux de bords personnalisés et temps réel.</div>

      <div v-if="edit && projectService.grafanaEnabled" class="mt-4">
        <div class="flex-col lg:flex lg:flex-row lg:space-x-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Type d'intégration</label>
            <select class="select select-bordered w-full mb-4" v-model="projectService.grafanaMode">
              <option value="MANAGED">Conteneur géré par Hexa-Data</option>
              <option value="EXTERNAL">Instance Grafana externe</option>
            </select>
          </div>
          <div class="flex-1" v-if="projectService.grafanaMode === 'MANAGED'">
            <label class="block text-sm font-medium text-gray-700 mb-2">Version du conteneur</label>
            <input type="text" :placeholder="'Laisser vide pour utiliser la version ' + grafanaDockerVersion"
              class="input input-bordered w-full mb-4" v-model="projectService.grafanaVersion" />
          </div>
          <div class="flex-1" v-if="projectService.grafanaMode === 'MANAGED'">
            <label class="block text-sm font-medium text-gray-700 mb-2">Hôte docker (host + port)</label>
            <div class="flex space-x-2">
              <input type="text" class="w-2/3 input input-bordered w-full mb-4" v-model="projectService.grafanaDockerHost" />
              <input type="text" class="w-1/3 input input-bordered w-full mb-4" v-model="projectService.grafanaDockerPort" />
            </div>
          </div>
          <div class="flex-1" v-if="projectService.grafanaMode === 'EXTERNAL'">
            <label class="block text-sm font-medium text-gray-700 mb-2">URL de l'instance exerne</label>
            <input type="text" class="input input-bordered w-full mb-4" v-model="projectService.grafanaUrl" />
          </div>
        </div>

        <div v-if="projectService.grafanaMode === 'MANAGED'" class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Configuration
            grafana.ini, <a class="text-primary-500" :href="grafanaDocumentationUrl" target="_blank">
              consulter la documentation</a></label>
          <codemirror class="w-full" :style="{ height: '10rem' }" v-model="projectService.grafanaConfiguration"
            :indent-with-tab="true" :tab-size="2" />
        </div>
        <div v-if="projectService.grafanaMode === 'MANAGED'" class="flex space-x-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe du compte d'écriture
              <code>{{ grafanaWriteUser }}</code>
            </label>
            <input type="text" class="input input-bordered w-full mb-4"
              placeholder="Laisser vide pour générer un mot de passe aléatoire"
              v-model="projectService.grafanaWriterPassword" />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe du compte de lecture
              <code>{{ grafanaReadUser }}</code>
            </label>
            <input type="text" class="input input-bordered w-full mb-4"
              placeholder="Laisser vide pour générer un mot de passe aléatoire"
              v-model="projectService.grafanaReaderPassword" />
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button v-if="edit && projectService.grafanaEnabled" @click="submit" :disabled="loading.submit"
          class="btn btn-warning mr-4">
          <span v-show="loading.submit" class="loading loading-spinner"></span>
          <template v-if="projectService.grafanaMode === 'MANAGED'">
            <span v-if="!project.grafanaEnabled || projectService.grafanaMode === 'EXTERNAL'">Déployer une nouvelle
              instance</span>
            <span v-else>Redéployer l'instance</span>
          </template>

          <template v-else>
            <span>Enregsitrer</span>
          </template>
        </button>

        <div class="ml-auto">
          <a v-if="project.grafanaEnabled" :href="project.grafanaUrl" target="_blank"
            class="btn btn-outline btn-primary mr-2">
            Accéder à l'interface
          </a>
          <button v-if="project.grafanaEnabled" @click="showDialog"
            :disabled="!edit || projectService.grafanaMode !== 'MANAGED'" class="btn btn-outline btn-primary">
            Gérer le conteneur
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, onBeforeUnmount, watch, nextTick } from 'vue'
import { Codemirror } from 'vue-codemirror'
import axios from '@/services/axios'
import bus from '@/services/bus'

const grafanaDocumentationUrl = ref('https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/')
const grafanaDockerVersion = ref(import.meta.env.VITE_DOCKER_GRAFANA_VERSION)
const grafanaWriteUser = ref(import.meta.env.VITE_DOCKER_GRAFANA_WRITE_USER)
const grafanaReadUser = ref(import.meta.env.VITE_DOCKER_GRAFANA_READ_USER)
const props = defineProps(['project', 'edit'])
const emit = defineEmits(['updated'])
const { project, edit }: any = toRefs(props)

const loading = ref({
  submit: false,
  enable: false
})

const projectService: any = ref({})
const updateProjectService = () => {
  projectService.value = {
    grafanaEnabled: project.value.grafanaEnabled || false,
    grafanaMode: project.value.grafanaMode || 'MANAGED',
    grafanaUrl: project.value.grafanaUrl || "",
    grafanaDockerHost: project.value.grafanaDockerHost || import.meta.env.VITE_DOCKER_HOST_IP,
    grafanaDockerPort: project.value.grafanaDockerPort || import.meta.env.VITE_DOCKER_HOST_PORT,
    grafanaVersion: project.value.grafanaVersion || "",
    grafanaConfiguration: project.value.grafanaConfiguration || "",
    grafanaReaderPassword: project.value.grafanaReaderPassword || "",
    grafanaWriterPassword: project.value.grafanaWriterPassword || ""
  }

  if (!project.value.grafanaConfiguration) {
    axios.get(`projects/services/grafana/config`).then((response) => {
      projectService.value.grafanaConfiguration = response.data.config
    })
  }
}
updateProjectService()
watch(project, updateProjectService, { deep: true })

/*
 * Actions
 */

// Remove the service
const toggleEnabled = () => {
  if (projectService.value.grafanaEnabled === true && project.value.grafanaEnabled && project.value.grafanaMode === 'MANAGED') {
    bus.emit('dialog.confirm', {
      message: "Souhaitez-vous vraiment supprimer le service Grafana ? Si le service était géré par Hexa-Data, toutes les données seront définitivement supprimées.",
      confirmText: "Supprimer le service",
      confirmClass: 'btn-error',
      onConfirm: async () => {
        loading.value.enable = true
        try {
          await submit()
          bus.emit('toast', {
            message: "La suppression du service Grafana a été effectuée avec succès !",
          })
          projectService.value.grafanaEnabled = false
        } catch (err: any) {
          bus.emit('toast', {
            message: "Une erreur est survenue lors de la suppression du service Grafana : " + err.message,
            severity: 'error',
          })
        } finally {
          loading.value.enable = false
        }
      },
      onCancel: () => {
        projectService.value.grafanaEnabled = true
      }
    })
  }
}

// Submit the service form, or deploy it 
const submit = async () => {
  loading.value.submit = true
  try {
    const response = await axios.post('projects/' + project.value.id + '/services/grafana', {
      ...projectService.value
    })

    bus.emit('toast', {
      message: "Le déploiement a été effectué avec succès !",
    })
  } catch (err: any) {
    bus.emit('toast', {
      message: "Une erreur est survenue lors du déploiement : " + err.message,
      severity: 'error',
    })
  } finally {
    emit('updated')
    loading.value.submit = false
  }
}

/*
 * Dialog
 */
const refDialog: any = ref(null)
const defaultDialog = {
  logs: '',
  terminal: {
    content: "Welcome to the container virtual terminal.\n" +
      "Type 'help' for the list of all available commands.",
    command: '',
    adminUser: false,
    loading: false
  },
  stats: {},
  offline: false,
  tab: 'terminal'
}
const dialog: any = ref(defaultDialog)

/*
 * Dialog Open/Close and infos refresh
 */
let infosInterval: any = null
const refreshInfos = async () => {
  try {
    const response = await axios.get('projects/' + project.value.id + '/services/grafana/status')
    dialog.value.logs = response.data.logs
    dialog.value.stats = response.data.stats
    dialog.value.offline = false
  } catch {
    dialog.value.offline = true
  } finally {
    await nextTick()
    scrollToBottom()
  }
}

const showDialog = async () => {
  refDialog.value.showModal()
  await refreshInfos()
  infosInterval = setInterval(async () => {
    await refreshInfos()
  }, 5000)
}
const closeDialog = () => {
  clearInterval(infosInterval)
  dialog.value = defaultDialog
}
const closeDialogFromEsc = (event: any) => {
  if (event.key === 'Escape') closeDialog()
}
window.addEventListener('keydown', closeDialogFromEsc)

onBeforeUnmount(() => {
  closeDialog()
  window.removeEventListener('keydown', closeDialogFromEsc)
  if (infosInterval) clearInterval(infosInterval)
})

/*
 * Scroll management
 */
const dialogContainer: any = ref(null)
const scrollToBottom = (force: boolean = false) => {
  if (dialogContainer.value) {
    const isUserAtBottom = dialogContainer.value.scrollHeight - dialogContainer.value.scrollTop - dialogContainer.value.clientHeight < 1
    if (force || isUserAtBottom) {
      dialogContainer.value.scrollTop = dialogContainer.value.scrollHeight
    }
  }
}

watch(() => dialog.value.tab, async () => {
  await nextTick()
  scrollToBottom(true)
})

/*
 * Terminal management
 */
const terminalInput: any = ref(null)
const onContentClick = () => {
  if (dialog.value.tab === 'terminal' && terminalInput.value) {
    terminalInput.value.focus()
  }
}

const commands: any = ref({
  "help": {
    description: "Show the list of all available commands",
    action: () => {
      let content = "Any input will be forwarded into \"docker exec <id>\", so you can run any command available in the container. You can also run root commands by clicking on \"$\" or \"#\".\n" +
        "Note that all commands are stateless, you should use \"&&\" to chain multiple commands. Example : \"cd foo/bar && npm run dev\".\n\n" +
        "Special commands are available:\n"
      for (const command in commands.value) {
        if (command !== "default") {
          content += "- " + command + " : " + commands.value[command].description + "\n"
        }
      }
      dialog.value.terminal.content += content.trim()
    }
  },
  "cls": {
    description: "Clear the terminal content",
    action: () => {
      dialog.value.terminal.content = ''
    }
  },
  "clear": {
    description: "Clear the terminal content",
    action: () => {
      dialog.value.terminal.content = ''
    }
  },
  "default": {
    description: "",
    action: async () => {
      const response = await axios.post('projects/' + project.value.id + '/services/grafana/exec', {
        command: dialog.value.terminal.command,
        adminUser: dialog.value.terminal.adminUser
      })
      dialog.value.terminal.content += response.data.output.trim()
    }
  },
  "stop": {
    description: "Stop the container",
    action: async () => {
      await axios.post('projects/' + project.value.id + '/services/grafana/stop')
      await refreshInfos()
      dialog.value.terminal.content += "Container stopped successfully."
    }
  },
  "start": {
    description: "Start the container",
    action: async () => {
      await axios.post('projects/' + project.value.id + '/services/grafana/start')
      await refreshInfos()
      dialog.value.terminal.content += "Container started successfully."
    }
  },
  "restart": {
    description: "Restart the container",
    action: async () => {
      await axios.post('projects/' + project.value.id + '/services/grafana/restart')
      await refreshInfos()
      dialog.value.terminal.content += "Container restarted successfully."
    }
  },
})

const sendCommand = async (command: string) => {
  command = command.trim()
  if (dialog.value.terminal.content) dialog.value.terminal.content += "\n"
  dialog.value.terminal.content += (dialog.value.terminal.adminUser ? "# " : "$ ") + command + "\n"

  dialog.value.terminal.loading = true
  try {
    if (commands.value[command]) {
      await commands.value[command].action()
    } else {
      await commands.value.default.action()
    }
  } catch (err: any) {
    dialog.value.terminal.content += err.message
  } finally {
    dialog.value.terminal.loading = false
    dialog.value.terminal.command = ''
    scrollToBottom(true)
    await nextTick()
    terminalInput.value.focus()
  }
}
</script>