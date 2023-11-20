<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="refBreadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft> </template>
      <template v-slot:menuRight class="p-3"> </template>
      <template v-slot:default>
        <form
          class="space-y-8 divide-y divide-gray-200 m-3"
          action="#"
          method="POST"
          @submit.prevent="create"
        >
          <div class="space-y-8 divide-y divide-gray-200">
            <div>
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ $t('devices.newDevice') }}
                </h3>
                <p class="mt-1 text-sm text-gray-500">{{ $t('devices.newDeviceDescription') }}</p>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.name')"
                    v-model="refDevice!.name"
                    :isRequired="true"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.namespace')"
                    v-model="refDevice!.namespace"
                    :isRequired="true"
                    :isDisabled="true"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.description')"
                    v-model="refDevice!.description"
                    :isRequired="false"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.dashboard')"
                    v-model="refDevice!.dashboardId"
                    :isRequired="false"
                    :isDisabled="false"
                    :choices="refDashboardName"
                    :values="refDashboardId"
                    :index-is-value="false"
                    :type="FieldType.SELECT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.adress')"
                    v-model="refDevice!.adress"
                    :isRequired="false"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.lat')"
                    v-model="refDevice!.lat"
                    :isRequired="false"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.long')"
                    v-model="refDevice!.long"
                    :isRequired="false"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.clientId')"
                    v-model="refDevice!.clientId"
                    :isRequired="true"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.username')"
                    v-model="refDevice!.username"
                    :isRequired="true"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.password')"
                    v-model="refDevice!.password"
                    :isRequired="true"
                    :isDisabled="false"
                    :confirm="true"
                    :type="FieldType.PASSWORD"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <Btn :text="$t('save')" :primary="true" class=""></Btn>
                </div>
              </div>
            </div>
          </div>
        </form>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { inject, ref } from 'vue'
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from '../../store/Store'
import Btn from '../../components/Btn.vue'
import FieldType from '../../Contracts/FieldType'
import InputField from '../../components/InputField.vue'
import DeviceModel from '../../Models/DeviceModel'
import DashboardModel from '../../Models/DashboardModel'
import { BaseController, ModelCollection } from './../../Classes/BaseController'
import { RouteService } from '../../Classes/RouteService'
import { Utils } from '../../Classes/Utils'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const refBreadCrumb = ref([
  { name: t('navigation.projects'), href: '/projects' },
  { name: store.currentProject.name, href: routePrefix },
  { name: t('new'), href: routePrefix + '/devices/create' },
])
const edit = ref(false)

const refDevice = ref(new DeviceModel())

const crudController = new BaseController<DeviceModel>(
  '/devices',
  [],
  refDevice.value,
  store.authUser.token['token']
)

crudController.setRoutePrefix(routePrefix)

const refDashboard = ref(new DashboardModel())
const refDashboardCollection = ref(new ModelCollection<DashboardModel>())

const dashboardCrudController = new BaseController<DashboardModel>(
  '/dashboards',
  [],
  refDashboard.value,
  store.authUser.token['token']
)

dashboardCrudController.setRoutePrefix(routePrefix)

const refDashboardName = ref<string[]>([])
const refDashboardId = ref<number[]>([])

async function init() {
  await RouteService.getProjectInfos(route)

  refDashboardCollection.value = await dashboardCrudController.index(1, 1000, '')
  refDashboardName.value = []
  refDashboardId.value = []
  for (const dashboard of refDashboardCollection.value.data) {
    refDashboardName.value.push(dashboard.name)
    refDashboardId.value.push(dashboard.id)
  }

  refBreadCrumb.value = [
    { name: t('navigation.projects'), href: '/projects' },
    { name: store.currentProject.name, href: routePrefix },
    { name: t('navigation.devices'), href: routePrefix + '/devices' },
    { name: t('new'), href: routePrefix + '/devices/create' },
  ]
}

async function create() {
  refDevice.value.namespace = Utils.camelCase(refDevice.value.name)
  await crudController.store(refDevice.value)
  router.push(routePrefix + '/devices')
}

function toggleEdit() {
  edit.value = !edit.value
  if (edit.value == false) {
    init()
  }
}
init()
</script>
