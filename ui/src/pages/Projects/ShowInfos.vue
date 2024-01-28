<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:default>
        <div class="m-3 h-1/3">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            {{ $t('projectInfos.project') + ' ' + refProjectInfo.name }}
          </h3>
          <h3 class="text-sm leading-6 font-normal text-gray-500">
            {{ $t('projectInfos.owner') + ': ' }}
            <a
              :href="'mailto:' + refProjectInfo.owner.email"
              class="text-blue-600 visited:text-purple-600"
              >{{ refProjectInfo.owner.email }}</a
            >
          </h3>
          <p class="mt-3">{{ refProjectInfo.description }}</p>
          <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div class="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ $t('projectInfos.devicesCount') }}
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ refProjectInfo.devicesCount }}
              </dd>
            </div>
            <div class="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ $t('projectInfos.tagCount') }}
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ refProjectInfo.tagCount }}
              </dd>
            </div>
          </dl>
          <div class="bg-white shadow overflow-hidden sm:rounded-md mt-3 h-2/3 z-0">
            <HdMap
              :deviceCollection="refDeviceCollection.data"
              :projectId="Number(route.params.id)"
            ></HdMap>
          </div>
        </div>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import Btn from '../../components/Btn.vue'
import InputField from '../../components/InputField.vue'
import InputFieldColorPicker from '../../components/InputFieldColorPicker.vue'
import FieldType from '../../Contracts/FieldType'
import Pagination from '../../components/Pagination.vue'
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from '../../store/Store'
import ProjectInfoModel from '../../Models/ProjectInfoModel'
import { BaseController, ModelCollection } from '../../Classes/BaseController'
import { DocumentIcon } from '@heroicons/vue/outline'
import DashboardModel from '../../Models/DashboardModel'
import { StarIcon, TemplateIcon } from '@heroicons/vue/outline'
import { RouteService } from '../../Classes/RouteService'
import HdMap from '../../components/HdMap.vue'
import DeviceModel from '../../Models/DeviceModel'

const router = useRouter()
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
