<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="refBreadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft>
      </template>
      <template v-slot:menuRight class="p-3">
        <Btn
          v-if="edit == true"
          :text="$t('Supprimer')"
          :primary="true"
          class="m-3"
          @click="remove"
        ></Btn>
        <Btn
          v-if="store.authUser.projectRole==RoleType.EDITOR || store.authUser.isAdmin==1 || store.currentProject.owner.id==store.authUser.id"
          :text="edit == true ? $t('cancel') : $t('edit')"
          :action="edit == true ?'cancel':'update'"
          :primary="false"
          class="m-3"
          @click="toggleEdit"
        ></Btn>
      </template>
      <template v-slot:default>
        <ComfirmPopup
          :title="$t('devices.deleteConfirmTitle')"
          :cancel-text="$t('cancel')"
          :confirm-text="$t('remove')"
          :msg="$t('devices.deleteConfirmMsg')"
          @comfirm="removeConfirmation"
          v-model="isOpen"
        ></ComfirmPopup>
        <div class="m-3">
          <h3 class="text-2xl leading-6 font-medium text-gray-900 mb-5">{{ refDevice.name }}</h3>
        </div>
        <div class="m-3">
          <h3 class="text-lg leading-6 font-medium text-gray-900">{{ $t('devices.MQTTStats') }}
          <div class="inline-block ml-5">
          <p
            v-if="refDevice.connected == true"
            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-200 text-green-800"
          >{{ $t('devices.connected') }}</p>
          <p
            v-if="refDevice.connected == false"
            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-200 text-white-800"
          >{{ $t('devices.disconnected') }}</p>
        </div>
        </h3>
          <p class="mt-1 text-sm text-gray-500">{{ $t('devices.MQTTStatsDescription') }}</p>
        </div>

        <DeviceStatsWarpChart
          v-if="refDevice.namespace != ''"
          :url="warp10Url"
          :class-name="refDevice.namespace + '.upMsgRate'"
          :value-type="3"
        ></DeviceStatsWarpChart>

        <form
          class="space-y-8 divide-y divide-gray-200 m-3"
          action="#"
          method="POST"
          @submit.prevent="update"
        >
          <div class="space-y-8 divide-y divide-gray-200">
            <div>
              <div>
                <h3
                  class="text-lg leading-6 font-medium text-gray-900"
                >{{ $t('settingsPage.generalSettings') }}</h3>
                <p
                  class="mt-1 text-sm text-gray-500"
                >{{ $t('settingsPage.generalSettingsDescription') }}</p>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.name')"
                    v-model="refDevice!.name"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.namespace')"
                    v-model="refDevice!.namespace"
                    :isRequired="false"
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
                    :isDisabled="!edit"
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
                    :isDisabled="!edit"
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
                    :isDisabled="!edit"
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
                    :isDisabled="!edit"
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
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.clientId')"
                    v-model="refDevice!.clientId"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.username')"
                    v-model="refDevice!.username"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('devices.password')"
                    v-model="refDevice!.password"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.PASSWORD"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <Btn v-if="edit" :text="$t('save')" :primary="true" class=""></Btn>
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
import { inject, ref } from 'vue';
import BaseLayoutVue from '../../layouts/BaseLayout.vue';
import { useRouter, useRoute } from 'vue-router'
import Store from '../../store/Store'
import DeviceStatsWarpChart from '../../components/DeviceStatsWarpChart.vue'
import Btn from '../../components/Btn.vue'
import FieldType from '../../Contracts/FieldType';
import InputField from '../../components/InputField.vue';
import DeviceModel from '../../Models/DeviceModel';
import { BaseController, ModelCollection } from '../../Classes/BaseController'
import { RouteService } from '../../Classes/RouteService'
import ComfirmPopup from '../../components/ComfirmPopup.vue'
import RoleType from '../../Contracts/RoleType';
import DashboardModel from '../../Models/DashboardModel';



const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const refBreadCrumb = ref([{ name: t('navigation.projects'), href: '/projects' }])
const edit = ref(false)
const isOpen = ref(false)

const warp10Url = window.location.origin + import.meta.env.VITE_API_PREFIX + '/warp10/' + route.params.id

const refDevice = ref(new DeviceModel())

const crudController = new BaseController<DeviceModel>(
  '/devices',
  [],
  refDevice.value,
  store.authUser.token['token'],
)

crudController.setRoutePrefix(routePrefix)

const refDashboard = ref(new DashboardModel())
const refDashboardCollection = ref(new ModelCollection<DashboardModel>())

const dashboardCrudController = new BaseController<DashboardModel>(
  '/dashboards',
  [],
  refDashboard.value,
  store.authUser.token['token'],
)

dashboardCrudController.setRoutePrefix(routePrefix)

const refDashboardName = ref<string[]>([])
const refDashboardId = ref<number[]>([])




init()

async function init() {
  await RouteService.getProjectInfos(route)
  refDevice.value = await crudController.show(Number(route.params.deviceId))

  refDashboardCollection.value=await dashboardCrudController.index(1,1000,'')
  refDashboardName.value=[]
  refDashboardId.value=[]
  for (const dashboard of refDashboardCollection.value.data) {
    refDashboardName.value.push(dashboard.name)
    refDashboardId.value.push(dashboard.id)
  }

  refBreadCrumb.value = [{ name: t('navigation.projects'), href: '/projects' }, { name: store.currentProject.name, href: routePrefix }, { name: t('navigation.devices'), href: routePrefix + '/devices' }, { name: refDevice.value.name, href: routePrefix + '/devices' + refDevice.value.id }]
}
async function update() {
  await crudController.update(refDevice.value, true)
  toggleEdit()
}
async function remove() {
  isOpen.value=true
}
async function removeConfirmation() {
  isOpen.value=false
  await crudController.remove(refDevice.value.id)
  router.push(routePrefix + '/devices')
}
function toggleEdit() {
  edit.value = !edit.value
  if (edit.value == false) {
    init()
  }
}
</script>
