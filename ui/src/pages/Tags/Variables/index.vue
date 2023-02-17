<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft>
        <SearchNav v-model="refSearch"></SearchNav>
      </template>
      <template v-slot:menuRight class="p-3">
        <label
          v-if="
            store.authUser.projectRole == RoleType.EDITOR ||
            store.authUser.isAdmin == 1 ||
            store.currentProject.owner.id == store.authUser.id
          "
          class="border-gray-300 text-gray-500 m-3 has-tooltip flex justify-center py-2 px-3 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <input class="hidden" type="file" @change="importCsv" />
          <UploadIcon class="flex-shrink-0 h-5 w-5 text-gray-400"></UploadIcon>
          <span class="tooltip bg-black p-2 mt-9 rounded-md text-white">{{
            $t('tags.import')
          }}</span>
        </label>
        <Btn
          v-if="
            store.authUser.projectRole == RoleType.EDITOR ||
            store.authUser.isAdmin == 1 ||
            store.currentProject.owner.id == store.authUser.id
          "
          :text="$t('tags.export')"
          :primary="false"
          :action="'download'"
          class="m-3"
          @click="exportCsv"
        ></Btn>
        <Btn
          v-if="
            store.authUser.projectRole == RoleType.EDITOR ||
            store.authUser.isAdmin == 1 ||
            store.currentProject.owner.id == store.authUser.id
          "
          :text="$t('tags.newVariable')"
          :primary="false"
          :action="'create'"
          class="m-3"
          @click="create"
        ></Btn>
      </template>
      <template v-slot:default>
        <div class="bg-white shadow overflow-hidden sm:rounded-md m-3 divide-y divide-gray-200">
          <CollapsableList
            v-for="item in Utils.hierarchizeData(refTagCollection.data).result"
            :key="item.namespace"
            :data="item"
            :level="1"
            route-suffix="/variables/"
          />
        </div>
        <Pagination :pagination="refTagCollection.pagination"></Pagination>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { inject, ref, watch } from 'vue'
import Pagination from '../../../components/Pagination.vue'
import BaseLayoutVue from '../../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from './../../../store/Store'
import TagModel from './../../../Models/TagModel'
import { BaseController, ModelCollection } from './../../../Classes/BaseController'
import { VariableIcon, UploadIcon } from '@heroicons/vue/outline'
import { RouteService } from '../../../Classes/RouteService'
import Btn from '../../../components/Btn.vue'
import SearchNav from '../../../components/SearchNav.vue'
import axios, { AxiosRequestConfig } from 'axios'
import RoleType from '../../../Contracts/RoleType'
import { Utils } from '../../../Classes/Utils'
import CollapsableList from '../../../components/CollapsableList.vue'

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const breadCrumb = ref([{ name: 'Projects', href: '/projects' }])
const { t } = useI18n()

const refSearch = ref('')
const refTag = ref(new TagModel())
const refTagCollection = ref(new ModelCollection<TagModel>())
const refNamespace = ref<string>(
  route.query['namespace'] ? route.query['namespace'].toString() : ''
)

const crudController = new BaseController<TagModel>(
  '/tags',
  [],
  refTag.value,
  store.authUser.token['token']
)

crudController.setRoutePrefix(routePrefix)

init()

async function init() {
  await RouteService.getProjectInfos(route)

  const page = route.query['page'] ? Number(route.query['page']) : 1
  refTagCollection.value = await crudController.index(page, 10, refSearch.value, {
    typeFilter: '1',
    namespace: refNamespace.value,
  })
  breadCrumb.value = [
    { name: 'Projects', href: '/projects' },
    { name: store.currentProject.name, href: routePrefix },
    { name: t('navigation.variables'), href: routePrefix + '/variables' },
  ]
}

async function create() {
  router.push(routePrefix + '/variables/create')
}
async function exportCsv() {
  let conf: AxiosRequestConfig<any> = {}
  conf.headers = { Authorization: `Bearer ${store.authUser.token.token}` }

  const url = import.meta.env.VITE_API_PREFIX + routePrefix + '/tags/exportCsv'

  const res = await axios.get(url, conf)

  const file = new Blob([res.data], { type: 'text/plain' })

  const a = document.createElement('a')
  const fileUrl = URL.createObjectURL(file)
  a.href = fileUrl
  a.download = 'export.csv'
  document.body.appendChild(a)
  a.click()
  setTimeout(function () {
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, 0)
}
async function importCsv(e: Event) {
  const target = e.target as HTMLInputElement
  const formData = new FormData()
  formData.append('csvFile', target.files![0])

  let conf: AxiosRequestConfig<any> = {}
  const url = import.meta.env.VITE_API_PREFIX + routePrefix + '/tags/importCsv'
  conf.headers = { Authorization: `Bearer ${store.authUser.token.token}` }
  const res = await axios.post(url, formData, conf)
  console.log(res)
  init()
}
watch(
  () => route.query['page'],
  () => {
    init()
  }
)
watch(
  () => route.query['namespace'],
  () => {
    init()
  }
)
watch(
  () => refSearch.value,
  () => {
    init()
  }
)
watch(
  () => refNamespace.value,
  () => {
    init()
  }
)
</script>
