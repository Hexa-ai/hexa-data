<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft></template>
      <template v-slot:menuRight class="p-3"></template>
      <template v-slot:default>
        <VarWarpChart
          class="m-3"
          :url="warp10Url"
          :class-name="'temperature.valeur1'"
          :value-type="refTag.valueType"
          :min-treshold="refTag.minTreshold"
          :max-treshold="refTag.maxTreshold"
          :is-alarm="refTag.alarm"
        ></VarWarpChart>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import VarWarpChart from '@/components/VarWarpChart.vue'
import { useI18n } from 'vue-i18n'
import { inject, ref } from 'vue'
import BaseLayoutVue from '@/layouts/BaseLayout.vue'
import { useRoute } from 'vue-router'
import Store from '@/store/Store'
import TagModel from '@/Models/TagModel'
import { BaseController, ModelCollection } from '@/Classes/BaseController'
import { RouteService } from '@/Classes/RouteService'
import DeviceModel from '@/Models/DeviceModel'
import { Utils } from '@/Classes/Utils'

const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const breadCrumb = ref([{ name: 'Projects', href: '/projects' }])
const { t } = useI18n()
const warp10Url =
  window.location.origin + import.meta.env.VITE_API_PREFIX + '/warp10/' + route.params.id

const refTag = ref(new TagModel())
const refTagCollection = ref(new ModelCollection<TagModel>())
const refDevice = ref(new DeviceModel())
const refDeviceCollection = ref(new ModelCollection<DeviceModel>())
const refUsedPhysicalUnits = ref<string[]>(['Duration', 'Flow', 'Temperature'])

const refDeviceName = ref<string[]>([])
const refDeviceId = ref<number[]>([])

const ws = ref('')
const crudController = new BaseController<TagModel>(
  '/tags',
  [],
  refTag.value,
  store.authUser.token['token']
)

crudController.setRoutePrefix(routePrefix)

const crudDeviceController = new BaseController<DeviceModel>(
  '/devices',
  [],
  refDevice.value,
  store.authUser.token['token']
)

crudDeviceController.setRoutePrefix(routePrefix)

init()

async function init() {
  await RouteService.getProjectInfos(route)
  refTag.value = await crudController.show(Number(route.params.tagId))
  refTagCollection.value = await crudController.index(1, 1000, '')
  refUsedPhysicalUnits.value.push(
    ...Utils.getUsedPhysicalUnitsFromTags(refTagCollection.value.data)
  )

  refTag.value.alarm = refTag.value.alarm && (refTag.value.alarm as unknown as number) === 1
  // @ts-ignore
  refTag.value.triggerType =
    refTag.value.triggerType && refTag.value.triggerType === 'rising' ? 1 : 2
  refDeviceCollection.value = await crudDeviceController.index(1, 100, '')
  refDeviceName.value = []
  refDeviceId.value = []
  for (const device of refDeviceCollection.value.data) {
    refDeviceName.value.push(device.name)
    refDeviceId.value.push(device.id)
  }
  ws.value =
    "10000000 LIMIT { 'token' $readToken 'class' '" +
    refTag.value.device!.namespace +
    '.' +
    refTag.value.name +
    "' 'labels' {} 'end' $end TOTIMESTAMP 'start' $start TOTIMESTAMP } FETCH 'datas' STORE $datas 0 GET ATTRIBUTES $language GET 'description' STORE $datas 0 GET { NULL NULL 'i' $description } SETATTRIBUTES 'data' STORE $data 10000 LTTB 'data' STORE $data"

  breadCrumb.value = [
    { name: 'Projects', href: '/projects' },
    { name: store.currentProject.name, href: routePrefix },
    { name: t('navigation.variables'), href: routePrefix + '/variables' },
  ]

  breadCrumb.value.push({
    name: refTag.value.device?.namespace + '.' + refTag.value.name,
    href: routePrefix + '/variables/' + route.params.tagId,
  })
}
</script>
