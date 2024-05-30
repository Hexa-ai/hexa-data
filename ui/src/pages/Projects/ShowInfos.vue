<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="false">
      <template v-slot:default>
        <div class="m-3 h-1/3">
          <h3 class="text-xl leading-10 font-medium text-gray-900">
            {{ $t('projectInfos.project') + ' ' + refProjectInfo.name }}
          </h3>
          <div class="stats w-full stats-vertical lg:stats-horizontal shadow mt-2">
            <div class="stat p-6">
              <div class="stat-figure text-primary">
                <ChipIcon class="menu-body-font flex-shrink-0 h-12 w-6"></ChipIcon>
              </div>
              <div class="stat-title">Equipements</div>
              <div class="stat-value text-primary mt-2">{{ refDeviceCollection.data.length }}</div>
              <div class="stat-desc mt-2">
                <span class="font-bold">{{ refDeviceCollection.data.filter(device => device.connected).length }}</span>
                en ligne,
                <span class="font-bold">{{ refDeviceCollection.data.filter(device => !device.connected).length }}</span>
                hors ligne
              </div>
            </div>

            <div class="stat p-6">
              <div class="stat-figure text-primary">
                <VariableIcon class="menu-body-font flex-shrink-0 h-12 w-6"></VariableIcon>
              </div>
              <div class="stat-title">Variables</div>
              <div class="stat-value text-primary mt-2">{{ variableCount }}</div>
              <div class="stat-desc mt-2">Dans la base de données</div>
            </div>

            <div class="stat p-6">
              <div class="stat-figure text-primary">
                <FolderIcon class="menu-body-font flex-shrink-0 h-12 w-6"></FolderIcon>
              </div>
              <div class="stat-title">Documents</div>
              <div class="stat-value text-primary mt-2">{{ documentStatistics.totalDocuments }}</div>
              <div class="stat-desc mt-2">Il y a <span class="font-bold">{{ documentStatistics.recentDocuments }}</span>
                création(s) cette semaine</div>
            </div>

            <div class="stat p-6">
              <div class="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="menu-body-font flex-shrink-0 h-12 w-6">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
              <div class="stat-title">Services</div>
              <div class="stat-value text-primary mt-2">{{ (refProjectInfo.grafanaEnabled ? 1 : 0) +
                (refProjectInfo.nodeRedEnabled ? 1 : 0) }}</div>
              <div class="stat-desc mt-2" v-if="refProjectInfo.grafanaEnabled || refProjectInfo.nodeRedEnabled">{{
                refProjectInfo.grafanaEnabled ? 'Graphana' : '' }} {{ refProjectInfo.nodeRedEnabled ? 'NodeRED' : '' }}
              </div>
              <div class="stat-desc mt-2" v-else>Aucun service actif</div>
            </div>
          </div>

          <div class="mt-2 -ml-2 -mr-2 flex flex-col md:flex-row">
            <div class="card m-2 shadow flex-1">
              <div class="card-body p-6">
                <h2 class="card-title mb-6">Détails</h2>
                <div class="mb-2" v-if="store.authUser.projectRole == RoleType.EDITOR || store.authUser.isAdmin">
                  <span class="label-text">Identifiant du projet :</span>
                  <div class="badge ml-2 font-semibold text-sm badge-ghost cursor-pointer"
                    @click="copyToClipboard(refProjectInfo.uuid)">{{ refProjectInfo.uuid }}</div>
                </div>

                <div class="flex gap-x-10">
                  <div class="basis-1/2">
                    <label class="label-text">Votre compte :</label>
                    <p class="text-slate-500 text-sm">
                      Vous êtes connecté en tant que
                      <strong class="font-semibold">{{ store.authUser.name }}</strong>, et vous êtes
                      <strong class="font-semibold" v-if="store.authUser.isAdmin">administrateur de la
                        plateforme</strong>
                      <strong class="font-semibold" v-if="store.authUser.projectRole == RoleType.EDITOR">éditeur du
                        projet</strong>.
                    </p>
                  </div>
                  <div class="basis-1/2">
                    <label class="label-text">{{ $t('projectInfos.description') }} :</label>
                    <p class="text-slate-500 text-sm">{{ refProjectInfo.description }}</p>
                  </div>
                </div>

                <div class="card-actions mt-4 justify-center"
                  v-if="store.authUser.projectRole == RoleType.EDITOR || store.authUser.isAdmin">
                  <router-link :to="`/projects/${refProjectInfo.id}/settings`"
                    class="btn btn-primary">Paramètres</router-link>
                  <button @click="tokenDialog.showModal()" class="btn btn-outline btn-primary">Jetons
                    d'authentification</button>
                </div>
              </div>
            </div>

            <div class="card m-2 shadow flex-1">
              <div class="card-body">
                <h2 class="card-title mb-4">Services</h2>

                <p v-if="!refProjectInfo.grafanaEnabled && !refProjectInfo.nodeRedEnabled">
                  Il n'y a pas de services actifs pour ce projet.</p>

                <ul class="services-list">
                  <li v-if="refProjectInfo.grafanaEnabled">Service <a href="#"
                      class="text-primary font-semibold">Grafana</a> : Visualisation et analyse des
                    données via des tableaux de bords temps réel.
                    <div class="ml-8" v-if="refProjectInfo.grafanaMode === 'MANAGED'">
                      • Identifiants :
                      <div class="badge font-semibold badge-ghost">{{ store.authUser.projectRole == RoleType.EDITOR ||
                        store.authUser.isAdmin ? grafanaWriteUser : grafanaReadUser }}</div>
                      <div class="badge font-semibold ml-1 badge-ghost cursor-pointer"
                        title="Cliquez pour dévoiler et copier dans le presse papier">
                        <span v-if="isGrafanaPasswordVisible"> {{ store.authUser.projectRole == RoleType.EDITOR ||
                          store.authUser.isAdmin ?
                          refProjectInfo.grafanaWriterPassword : refProjectInfo.grafanaReaderPassword }}</span>
                        <span v-else @click="showGrafanaPassword">**********</span>
                      </div>
                    </div>
                  </li>
                  <li v-if="refProjectInfo.nodeRedEnabled" class="mt-2">Service <a href="#"
                      class="text-primary font-semibold">NodeRED</a> : Programmation
                    visuelle basée sur des flux adaptés à l'IoT.
                    <div class="ml-8" v-if="store.authUser.projectRole == RoleType.EDITOR || store.authUser.isAdmin">
                      • Identifiants :
                      <div class="badge font-semibold badge-ghost">{{ nodeRedWriteUser }}</div>
                      <div class="badge font-semibold ml-1 badge-ghost cursor-pointer"
                        title="Cliquez pour dévoiler et copier dans le presse papier">
                        <span v-if="isNodeRedPasswordVisible">{{ refProjectInfo.nodeRedWriterPassword }}</span>
                        <span v-else @click="showNodeRedPassword">**********</span>
                      </div>
                    </div>
                  </li>
                </ul>
                <div class="card-actions mt-4 justify-center">
                  <a v-if="refProjectInfo.grafanaEnabled" target="_blank" :href="refProjectInfo.grafanaUrl"
                    class="btn btn-primary">Accéder à Grafana</a>

                  <a v-if="refProjectInfo.grafanaEnabled && (store.authUser.projectRole == RoleType.EDITOR || store.authUser.isAdmin)"
                    target="_blank" :href="refProjectInfo.nodeRedUrl" class="btn btn-primary">Accéder à NodeRED</a>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white shadow overflow-hidden sm:rounded-md mt-3 h-2/3 z-0">
            <HdMap :deviceCollection="refDeviceCollection.data" :projectId="Number(route.params.id)"></HdMap>
          </div>
        </div>

        <dialog ref="tokenDialog" class="modal">
          <div class="modal-box">
            <form method="dialog" class="absolute right-3 top-3" @click="tokenDialog.closeDialog()">
              <kbd class="kbd kbd-xs mr-1">esc</kbd>
              <button class="btn btn-sm btn-circle btn-ghost ">✕</button>
            </form>
            <h3 class="font-bold text-lg">Jetons long terme</h3>
            <div class="py-4">
              <label>
                <span class="label label-text">{{ $t('projectInfos.uuid') }}</span>
                <textarea rows="1" v-model="refProjectInfo.uuid" class="textarea textarea-bordered w-full"
                  @click.prevent="copyToClipboard(refProjectInfo.uuid)"
                  @focus="($event.target && ($event.target as HTMLInputElement).select())"
                  style="cursor: pointer;"></textarea>
              </label>
              <label>
                <span class="label label-text">{{ $t('projectInfos.readToken') }}</span>
                <textarea rows="3" v-model="refProjectInfo.persistentReadToken"
                  class="textarea textarea-bordered w-full" title="Cliquez pour copier dans le presse papier"
                  @click="copyToClipboard(refProjectInfo.persistentReadToken)"
                  @focus="($event.target && ($event.target as HTMLInputElement).select())"
                  style="cursor: pointer;"></textarea>
              </label>
              <label>
                <span class="label label-text">{{ $t('projectInfos.writeToken') }}</span>
                <textarea rows="3" v-model="refProjectInfo.persistentWriteToken"
                  class="textarea textarea-bordered w-full" title="Cliquez pour copier dans le presse papier"
                  @click="copyToClipboard(refProjectInfo.persistentWriteToken)"
                  @focus="($event.target && ($event.target as HTMLInputElement).select())"
                  style="cursor: pointer;"></textarea>
              </label>
              <p class="mt-4">Vous pouvez créer et regénérer des tokens dans la <router-link
                  :to="`/projects/${refProjectInfo.id}/settings`" class="text-primary-500">page paramètres</router-link>
                du projet.</p>
            </div>
            <div class="modal-action">
              <form method="dialog">
                <button class="btn">Fermer</button>
              </form>
            </div>
          </div>
        </dialog>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<style scoped>
.services-list>li::before {
  content: '\2713';
  /* Unicode for check mark */
  display: inline-block;
  margin-right: 0.5rem;
  color: #635faf;
  /* Change color as needed */
}
</style>

<script setup lang="ts">
import { inject, ref } from 'vue'
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useRoute } from 'vue-router'
import Store from '../../store/Store'
import ProjectInfoModel from '../../Models/ProjectInfoModel'
import { BaseController, ModelCollection } from '../../Classes/BaseController'
import DashboardModel from '../../Models/DashboardModel'
import { RouteService } from '../../Classes/RouteService'
import HdMap from '../../components/HdMap.vue'
import DeviceModel from '../../Models/DeviceModel'
import RoleType from '@/Contracts/RoleType'
import axios from '@/services/axios'
import { ChipIcon, VariableIcon, FolderIcon } from '@heroicons/vue/outline'
import bus from '@/services/bus'

const grafanaWriteUser = ref(import.meta.env.VITE_DOCKER_GRAFANA_WRITE_USER)
const grafanaReadUser = ref(import.meta.env.VITE_DOCKER_GRAFANA_READ_USER)
const nodeRedWriteUser = ref(import.meta.env.VITE_DOCKER_NODERED_WRITE_USER)

const isGrafanaPasswordVisible = ref(false)
const showGrafanaPassword = () => {
  isGrafanaPasswordVisible.value = true
  if (store.authUser.projectRole == RoleType.EDITOR || store.authUser.isAdmin) {
    copyToClipboard(refProjectInfo.value.grafanaWriterPassword)
  } else {
    copyToClipboard(refProjectInfo.value.grafanaReaderPassword)
  }
}

const isNodeRedPasswordVisible = ref(false)
const showNodeRedPassword = () => {
  isNodeRedPasswordVisible.value = true
  copyToClipboard(refProjectInfo.value.nodeRedWriterPassword)
}

const copyToClipboard = (text: string) => {
  const el = document.createElement('textarea')
  el.value = text
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)

  bus.emit('toast', {
    message: "La valeur a été copiée dans le presse papier",
  })
}

const tokenDialog: any = ref(null)

const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const refProjectInfo = ref(new ProjectInfoModel())
const breadCrumb = ref([
  { name: 'Projects', href: '/projects' },
  { name: refProjectInfo.value.name, href: routePrefix },
])

const refdashboard = ref(new DashboardModel())
const refdashboardCollection = ref(new ModelCollection<DashboardModel>())

const refDevice = ref(new DeviceModel())
const refDeviceCollection = ref(new ModelCollection<DeviceModel>())

const deviceCrudController = new BaseController<DeviceModel>(
  '/devices',
  [],
  refDevice.value,
  store.authUser.token['token']
)
const projectCrudController = new BaseController<ProjectInfoModel>(
  '/projects',
  [{ name: 'photo' }],
  refProjectInfo.value,
  store.authUser.token['token']
)
const dashboardCrudController = new BaseController<DashboardModel>(
  '/dashboards',
  [{ name: 'photo' }],
  refdashboard.value,
  store.authUser.token['token']
)
deviceCrudController.setRoutePrefix(routePrefix)

dashboardCrudController.setRoutePrefix('/projects/' + String(route.params.id))

init()

const documentStatistics = ref({
  recentDocuments: '-',
  totalDocuments: '-'
})

const variableCount = ref('-')

async function init() {
  await RouteService.getProjectInfos(route)
  refProjectInfo.value = await projectCrudController.show(Number(route.params.id))
  store.currentProject = refProjectInfo.value

  breadCrumb.value = [
    { name: 'Projects', href: '/projects' },
    { name: refProjectInfo.value.name, href: '/projects/' + route.params.id },
  ]

  refdashboardCollection.value = await dashboardCrudController.index(1, 10, '', { stared: '1' })
  refDeviceCollection.value = await deviceCrudController.index(1, 300)

  const documentStatisticsResponse = await axios.get(`/projects/${route.params.id}/statistics`)
  documentStatistics.value.recentDocuments = documentStatisticsResponse.data.recentDocuments
  documentStatistics.value.totalDocuments = documentStatisticsResponse.data.totalDocuments

  const variablesResponse = await axios.get(`/projects/${route.params.id}/warp10/variables?search=`)
  variableCount.value = variablesResponse.data.result[0].length
}

function getDescAttrName(model: DashboardModel): string {
  if (store.authUser.lang == store.currentProject.l2) {
    return model['descriptionL2']
  } else if (store.authUser.lang == store.currentProject.l3) {
    return model['descriptionL3']
  } else {
    return model['descriptionL1']
  }
}
</script>
