<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:default>
        <div class="m-3">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            {{ $t('projectInfos.project') + ' ' + refProjectInfo.name }}
          </h3>
          <h3 class="text-sm leading-6 font-normal text-gray-500">
            {{ $t('projectInfos.owner') + ': ' }}
            <a :href="'mailto:' + refProjectInfo.owner.email" class="text-blue-600 visited:text-purple-600">{{
      refProjectInfo.owner.email }}</a>
          </h3>
          <div class="mt-3">
            <label class="label-text">{{ $t('projectInfos.description') }} :</label>
            <div>{{ refProjectInfo.description }}</div>
          </div>
          <div class="w-1/2" v-if="store.authUser.projectRole == RoleType.EDITOR || store.authUser.isAdmin">
            <label>
              <span class="label label-text">{{ $t('projectInfos.uuid') }}</span>
              <textarea rows="1" v-model="refProjectInfo.uuid" disabled class="textarea textarea-bordered w-full"></textarea>
            </label>
            <label>
              <span class="label label-text">{{ $t('projectInfos.readToken') }}</span>
              <textarea rows="3" v-model="refProjectInfo.readToken" disabled class="textarea textarea-bordered w-full"></textarea>
            </label>
            <label>
              <span class="label label-text">{{ $t('projectInfos.writeToken') }}</span>
              <textarea rows="3" v-model="refProjectInfo.writeToken" disabled class="textarea textarea-bordered w-full"></textarea>
            </label>
          </div>
        </div>
      </template>
    </BaseLayoutVue>
  </div>
</template>

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
