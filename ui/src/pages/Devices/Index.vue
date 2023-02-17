<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="refBreadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft>
        <SearchNav
        v-model="refSearch"
        ></SearchNav>
      </template>
      <template v-slot:menuRight class="p-3">
        <Btn
          v-if="store.authUser.projectRole==RoleType.EDITOR || store.authUser.isAdmin==1 || store.currentProject.owner.id==store.authUser.id"
          :text="$t('devices.newDevice')"
          :action="'create'"
          :primary="false"
          class="m-3"
          @click="create"
        ></Btn>
      </template>
      <template v-slot:default>
        <div class="bg-white shadow overflow-hidden sm:rounded-md m-3">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="device in refDeviceCollection.data" :key="device.id">
              <router-link
                :to="routePrefix + /devices/ + device.id"
                class="block hover:bg-gray-50"
              >
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ device.name }}</p>
                    <div class="ml-2 flex-shrink-0 flex">
                      <p
                        v-if="device.connected==true"
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-200 text-green-800"
                      >{{ $t('devices.connected') }}</p>
                      <p
                        v-if="device.connected==false"
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-200 text-white-800"
                      >{{ $t('devices.disconnected') }}</p>
                    </div>
                  </div>
                  <div class="mt-2 sm:flex sm:justify-between">
                    <div class="sm:flex">
                      <p class="flex items-center text-sm text-gray-500">
                        <ChipIcon
                          class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        {{device.description}}
                      </p>
                    </div>
                    <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <div v-if="device.ip!=''" class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">{{'IP: '+ device.ip}}</div>
                      <div v-if="device.ip==''" class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">{{'IP: ---.---.---.---'}}</div>
                    </div>

                  </div>
                </div>
              </router-link>
            </li>
          </ul>
        </div>
        <Pagination :pagination="refDeviceCollection.pagination"></Pagination>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n  } from 'vue-i18n'
import { inject, ref, watch } from 'vue';
import Pagination from '../../components/Pagination.vue';
import BaseLayoutVue from '../../layouts/BaseLayout.vue';
import { useRouter, useRoute } from 'vue-router'
import Store from '../../store/Store'
import DeviceModel from '../../Models/DeviceModel';
import { BaseController, ModelCollection } from '../../Classes/BaseController'
import { ChipIcon } from '@heroicons/vue/outline'
import { RouteService } from '../../Classes/RouteService'
import Btn from '../../components/Btn.vue'
import SearchNav from '../../components/SearchNav.vue';
import RoleType from '../../Contracts/RoleType';

const {t} = useI18n()
const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const refBreadCrumb = ref([{ name: t('navigation.projects'), href: '/projects' }])


const refSearch =ref('')
const refDevice = ref(new DeviceModel())
const refDeviceCollection = ref(new ModelCollection<DeviceModel>())

const crudController = new BaseController<DeviceModel>(
  '/devices',
  [],
  refDevice.value,
  store.authUser.token['token'],
)

crudController.setRoutePrefix(routePrefix)

init()

async function init() {
  await RouteService.getProjectInfos(route)
  const page = route.query['page'] ? Number(route.query['page']) : 1
  refDeviceCollection.value = await crudController.index(page, 100, refSearch.value)
  refBreadCrumb.value=[{ name: t('navigation.projects'), href: '/projects' }, { name: store.currentProject.name, href: routePrefix },{ name: t('navigation.devices'), href: routePrefix + '/devices' }]
}
async function create(){
  router.push(routePrefix + '/devices/create')
}
watch(() => route.query['page'], () => {
      init()
});
watch(() => refSearch.value, () => {
      init()
});
</script>
