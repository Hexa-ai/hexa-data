<template>
  <div id="page" class="h-full">
    <BaseLayoutVue
      :pages-bread-crumb="breadCrumb"
      :show-tool-bar="false"
      :bgColor="refDashboard.colorBg"
      :enableImgBg="refDashboard.enableImgBg"
      :imgBgUrl="refImgBgUrl"
      class="h-full z-10"
    >
      <template v-slot:menuTopRight>
        <div class="flex grow flex-col items-end">
          <div class="flex items-end mt-3 lg:w-5/6 md:w-full">
            <RequestLoader class="lg:w-1/6 md:w-1/6"></RequestLoader>
            <InputFieldDateWarp
              class="lg:w-5/6 md:w-4/6"
              :dateRange="initialDateRange"
              :baseUrl="refWarp10BaseUrl"
              @update:outputUrl="updateDashboardUrl"
            ></InputFieldDateWarp>
          </div>
        </div>
      </template>
      <template v-slot:menuLeft></template>
      <template v-slot:menuRight class="p-3"></template>
      <template v-slot:default>
        <div class="hexa-dashboard h-fit">
          <discovery-dashboard
            class="discovery-dashboard z-1"
            v-if="refShowDashboard == true && refDashboard.type == 'Discovery'"
            :url="refWarp10Url"
            :options="options"
            >{{ refScript }}</discovery-dashboard
          >
          <DashboardGrid
            class="continuum-dashboard z-1"
            v-if="refDashboard.type == 'Continuum' && refShowDashboard == true"
            :edit="false"
            :url="refWarp10Url"
            :float="refDashboard.float"
            :data="refDashboard"
            :add="false"
            :save="false"
          >
          </DashboardGrid>
        </div>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, inject, onBeforeUpdate, onUpdated, ref, watch } from 'vue'
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from './../../store/Store'
import { BaseController, ModelCollection } from './../../Classes/BaseController'
import { RouteService } from '../../Classes/RouteService'
import DashboardModel from '../../Models/DashboardModel'
import DashboardGrid from '../../components/DashboardGrid.vue'
import TileModel from '../../Models/TileModel'
import DashboardModelBackend from '../../Models/DashboardModelBackend'
import InputFieldDateWarp from '../../components/InputFieldDateWarp.vue'
import RequestLoader from '../../components/RequestLoader.vue'

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const breadCrumb = ref([{ name: 'Projects', href: '/projects' }])
const { t } = useI18n()
const refIsMobile = ref(false)
const qs = window.location.search
const refWarp10BaseUrl = ref(
  window.location.origin + import.meta.env.VITE_API_PREFIX + '/warp10/' + route.params.id + qs
)
const refWarp10Url = ref('')
const refShowDashboard = ref(false)
const refDashboard = ref(new DashboardModel())
let refDashboardBackend = ref(new DashboardModelBackend())
const refDatePickerRange = ref([])
const refScript = ref('')
const refImgBgUrl = ref('')
const options = { httpHeaders: { Authorization: 'Bearer ' + store.authUser.token.token } }

const crudController = new BaseController<DashboardModel>(
  '/dashboards',
  [],
  refDashboard.value,
  store.authUser.token['token']
)

crudController.setRoutePrefix(routePrefix)

const refAppBodyHeight = ref(0)
const refAppBodyWidth = ref(0)

const initialDateStart = new Date()
initialDateStart.setHours(initialDateStart.getHours() - 1)
const initialDateEnd = new Date()
const initialDateRange = ref<[string, string]>(
  store.memoDateRange[0] == '' && store.memoDateRange[1] == ''
    ? [initialDateStart.toISOString(), initialDateEnd.toISOString()]
    : store.memoDateRange
)

onUpdated(() => {
  getAppBodySize()
  window.addEventListener('resize', function (event) {
    getAppBodySize()
  })
})
function updateDashboardUrl(dateRange: any) {
  refWarp10Url.value = dateRange.url
  store.memoDateRange = dateRange.dateRange
}

let AppBodyHeight = computed(() => refAppBodyHeight.value - 20)

function getAppBodySize() {
  if (document.getElementById('appBody')!.clientWidth > 768) {
    refIsMobile.value = false
  } else {
    refIsMobile.value = true
  }
  refAppBodyHeight.value = document.getElementById('page')!.clientHeight - 128
  refAppBodyWidth.value = document.getElementById('appBody')!.clientWidth
}
async function init() {
  await RouteService.getProjectInfos(route)

  refDashboardBackend.value = await crudController.show(Number(route.params.dashboardId))
  refDashboard.value.body = refDashboardBackend.value.body
  refDashboard.value.colorBg = refDashboardBackend.value.colorBg
  refDashboard.value.descriptionL1 = refDashboardBackend.value.descriptionL1
  refDashboard.value.descriptionL2 = refDashboardBackend.value.descriptionL2
  refDashboard.value.descriptionL3 = refDashboardBackend.value.descriptionL3
  refDashboard.value.enableImgBg = refDashboardBackend.value.enableImgBg
  refDashboard.value.id = refDashboardBackend.value.id
  refDashboard.value.imgBg = refDashboardBackend.value.imgBg
  refDashboardBackend.value.imgBg != null
    ? (refImgBgUrl.value = refDashboardBackend.value.imgBg.url)
    : (refImgBgUrl.value = '')
  refDashboard.value.name = refDashboardBackend.value.name
  refDashboard.value.stared = refDashboardBackend.value.stared
  refDashboard.value.type = refDashboardBackend.value.type

  if (refDashboard.value.type == 'Continuum') {
    const bodyObj = JSON.parse(refDashboard.value.body)
    if (bodyObj == '' || bodyObj == null) {
      refDashboard.value.tiles = [new TileModel()]
    } else {
      refDashboard.value.tiles = bodyObj.tiles
      refDashboard.value.float = bodyObj.float
    }
  } else {
    refScript.value = refDashboard.value.body
  }

  refShowDashboard.value = true
  breadCrumb.value = [
    { name: 'Projects', href: '/projects' },
    { name: store.currentProject.name, href: routePrefix },
    { name: t('navigation.dashboards'), href: routePrefix + '/dashboards' },
    { name: refDashboard.value.name, href: routePrefix + '/dashboards/' + refDashboard.value.id },
  ]
}
init()
</script>

<style>
.hexa-dashboard {
  --warp-view-pagination-bg-color: white;
  --warp-view-pagination-disabled-color: white;
  --warp-view-pagination-active-bg-color: v-bind(store.publicAppSettings.appMenuBgCurrentBodyColor);
  --warp-view-pagination-active-color: v-bind(store.publicAppSettings.appMenuFontOverBodyColor);
  --warp-view-pagination-hover-bg-color: rgb(209 213 219);
}
</style>
