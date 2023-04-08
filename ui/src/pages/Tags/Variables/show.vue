<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft></template>
      <template v-slot:menuRight class="p-3">
        <Btn
          v-if="edit == true"
          :text="$t('Supprimer')"
          :primary="true"
          class="m-3"
          @click="remove"
        ></Btn>
        <Btn
          v-if="
            store.authUser.projectRole == RoleType.EDITOR ||
            store.authUser.isAdmin == 1 ||
            store.currentProject.owner.id == store.authUser.id
          "
          :text="edit == true ? $t('cancel') : $t('edit')"
          :primary="false"
          :action="edit == true ? 'cancel' : 'update'"
          class="m-3"
          @click="toggleEdit"
        ></Btn>
      </template>
      <template v-slot:default>
        <ComfirmPopup
          :title="$t('tags.variableDeleteConfirmTitle')"
          :cancel-text="$t('cancel')"
          :confirm-text="$t('remove')"
          :msg="$t('tags.variableDeleteConfirmMsg')"
          @comfirm="removeConfirmation"
          v-model="isOpen"
        ></ComfirmPopup>
        <VarWarpChart
          v-if="typeof refTag.device != 'undefined'"
          class="m-3"
          :url="warp10Url"
          :class-name="refTag.device!.namespace + '.' + refTag.name"
          :value-type="refTag.valueType"
        ></VarWarpChart>
        <form
          class="m-3 space-y-8 divide-y divide-gray-200"
          action="#"
          method="POST"
          @submit.prevent="update"
        >
          <div class="space-y-8 divide-y divide-gray-200">
            <div>
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ $t('tags.parameters') }}
                </h3>
                <p class="mt-1 text-sm text-gray-500"></p>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.name')"
                    v-model="refTag!.name"
                    :isRequired="false"
                    :isDisabled="true"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.description') + ' (' + store.currentProject.l1 + ')'"
                    v-model="refTag!.descriptionL1"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.description') + ' (' + store.currentProject.l2 + ')'"
                    v-model="refTag!.descriptionL2"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.description') + ' (' + store.currentProject.l3 + ')'"
                    v-model="refTag!.descriptionL3"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.unit')"
                    v-model="refTag!.unit"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.device')"
                    v-model="refTag!.deviceId"
                    :isRequired="false"
                    :isDisabled="true"
                    :choices="refDeviceName"
                    :values="refDeviceId"
                    :index-is-value="false"
                    :type="FieldType.SELECT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.valueType')"
                    v-model="refTag!.valueType"
                    :isRequired="false"
                    :isDisabled="true"
                    :choices="[
                      '',
                      $t('tags.boolean'),
                      $t('tags.integer'),
                      $t('tags.real'),
                      $t('tags.string'),
                    ]"
                    :index-is-value="true"
                    :type="FieldType.SELECT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.alarm')"
                    v-model="refTag!.alarm"
                    :isRequired="true"
                    :isDisabled="false"
                    :index-is-value="true"
                    :type="FieldType.CHECKBOX"
                  ></InputField>
                </div>
              </div>
              <div
                class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6"
                v-if="showTresholdField"
              >
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.minTreshold')"
                    v-model="refTag!.minTreshold"
                    :isRequired="true"
                    :isDisabled="false"
                    :type="FieldType.NUMBER"
                  ></InputField>
                </div>
              </div>
              <div
                class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6"
                v-if="showTresholdField"
              >
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.maxTreshold')"
                    v-model="refTag!.maxTreshold"
                    :isRequired="true"
                    :isDisabled="false"
                    :type="FieldType.NUMBER"
                  ></InputField>
                </div>
              </div>
              <div
                class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6"
                v-if="showTresholdField"
              >
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.triggerType')"
                    v-model="refTag!.triggerType"
                    :isDisabled="false"
                    :type="FieldType.SELECT"
                    :index-is-value="true"
                    :choices="['', $t('tags.triggerTypes.falling'), $t('tags.triggerTypes.rising')]"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2 space-y-6">
                  <InputField
                    :title="$t('tags.physicalUnit')"
                    v-model="refTag!.physicalUnit"
                    :isDisabled="false"
                    :type="FieldType.SELECT"
                    :choices="[
                      $t('tags.physicalUnitTypes.duration'),
                      $t('tags.physicalUnitTypes.flow'),
                      $t('tags.physicalUnitTypes.temperature'),
                      ...refUsedPhysicalUnits,
                      $t('other'),
                    ]"
                    :values="['Duration', 'Flow', 'Temperature', ...refUsedPhysicalUnits, '']"
                  />
                  <InputField
                    v-if="showPhysicalUnitInput"
                    v-model="refTag!.physicalUnit"
                    :type="FieldType.TEXT"
                    :is-disabled="false"
                    :title="$t('tags.physicalUnit')"
                  />
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
import VarWarpChart from './../../../components/VarWarpChart.vue'
import { useI18n } from 'vue-i18n'
import { inject, ref, computed } from 'vue'
import BaseLayoutVue from '../../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from './../../../store/Store'
import TagModel from './../../../Models/TagModel'
import Btn from './../../../components/Btn.vue'
import InputField from './../../../components/InputField.vue'
import FieldType from './../../../Contracts/FieldType'
import { BaseController, ModelCollection } from './../../../Classes/BaseController'
import { RouteService } from '../../../Classes/RouteService'
import ComfirmPopup from '../../../components/ComfirmPopup.vue'
import DeviceModel from '../../../Models/DeviceModel'
import RoleType from '../../../Contracts/RoleType'
import { Utils } from '../../../Classes/Utils'

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const breadCrumb = ref([{ name: 'Projects', href: '/projects' }])
const { t } = useI18n()
const warp10Url =
  window.location.origin + import.meta.env.VITE_API_PREFIX + '/warp10/' + route.params.id
const isOpen = ref(false)

const refTag = ref(new TagModel())
const refTagCollection = ref(new ModelCollection<TagModel>())
const refDevice = ref(new DeviceModel())
const refDeviceCollection = ref(new ModelCollection<DeviceModel>())
const refUsedPhysicalUnits = ref<string[]>(['Duration', 'Flow', 'Temperature'])

const refDeviceName = ref<string[]>([])
const refDeviceId = ref<number[]>([])

const edit = ref(false)

const showTresholdField = computed(
  () => refTag.value.alarm === true && (refTag.value.valueType == 2 || refTag.value.valueType == 3)
)
const showPhysicalUnitInput = computed(() => {
  return (
    !refTag!.value.physicalUnit ||
    (refTag!.value.physicalUnit !== 'Duration' &&
      refTag!.value.physicalUnit !== 'Flow' &&
      refTag!.value.physicalUnit !== 'Temperature' &&
      !refUsedPhysicalUnits.value.includes(refTag!.value.physicalUnit))
  )
})

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
    refTag.value.triggerType && (refTag.value.triggerType as unknown as number) === 'rising' ? 1 : 2
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

  if (refTag.value.device?.namespace) {
    breadCrumb.value.push({
      name: refTag.value.device?.namespace,
      href: routePrefix + '/variables?namespace=' + refTag.value.device?.namespace,
    })
  }

  breadCrumb.value.push({
    name: refTag.value.device?.namespace + '.' + refTag.value.name,
    href: routePrefix + '/variables/' + route.params.tagId,
  })
}
async function update() {
  const data = refTag.value
  const triggerTypeIndex = Number(data.triggerType)
  if (triggerTypeIndex === 1) {
    data.triggerType = 'rising'
  } else if (triggerTypeIndex === 2) {
    data.triggerType = 'falling'
  }

  data.minTreshold = Number(data.minTreshold)
  data.maxTreshold = Number(data.maxTreshold)
  await crudController.update(data, true)
  edit.value = false
  init()
}
function toggleEdit() {
  edit.value = !edit.value
  if (edit.value == false) {
    init()
  }
}
async function remove() {
  isOpen.value = true
}
async function removeConfirmation() {
  isOpen.value = false
  await crudController.remove(refTag.value.id)
  router.push(routePrefix + '/variables')
}
</script>
