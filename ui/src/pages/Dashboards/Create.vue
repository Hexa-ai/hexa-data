<template>
  <div id="page" class="h-full">
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft>
        <InputSwitch
          class="ml-3"
          :text1="$t('tags.warpScriptEditor')"
          :text2="''"
          v-model="refEditorSwitch"
        ></InputSwitch>
        <InputSwitch
          v-if="refEditorSwitch"
          class="ml-3"
          :text1="$t('tags.light')"
          :text2="''"
          v-model="refEditorLight"
        >
          <SunIcon class="flex-shrink-0 m-0 h-5 w-5 text-gray-400" aria-hidden="true" />
        </InputSwitch>
        <a
          :href="routePrefix + '/dashboards/' + route.params.dashboardId"
          onclick="window.open(this.href); return false;"
          class="m-3 border-gray-300 text-gray-500 flex justify-center py-2 px-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <PlayIcon class="mr-1 flex-shrink-0 m-0 h-5 w-5 text-gray-400" aria-hidden="true" />
          {{ ' ' + $t('dashboards.preview') }}
        </a>
      </template>
      <template v-slot:menuRight class="p-3">
        <Btn
          v-if="refEditorSwitch"
          :text="'Sauvegarder'"
          :primary="false"
          class="m-3"
          @click="create"
        ></Btn>
      </template>
      <template v-slot:default>
        <div :style="'height: ' + AppBodyHeight + 'px;'">
          <form class="divide-gray-200 h-full" action="#" method="POST" @submit.prevent="create">
            <warp-view-editor
              v-show="refEditorSwitch"
              url="https://warp.senx.io/api/v0/exec"
              id="wsEditor"
              :warpscript="refScript"
              :theme="refEditorLight == true ? 'light' : 'dark'"
              :horizontalLayout="true"
              :show-execute="refEdit"
              :show-dataviz="false"
              :display-messages="true"
              :config="refConfig"
            ></warp-view-editor>
            <div v-if="!refEditorSwitch" class="ml-5 mr-5 space-y-8 divide-y divide-gray-200">
              <div>
                <div>
                  <h3 class="text-lg leading-6 font-medium text-gray-900">
                    {{ $t('tags.parameters') }}
                  </h3>
                  <p class="mt-1 text-sm text-gray-500"></p>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-4">
                    <InputField
                      :title="$t('tags.name')"
                      v-model="refDashboard!.name"
                      :isRequired="true"
                      :isDisabled="false"
                      :type="FieldType.TEXT"
                    ></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-5">
                    <InputField
                      :title="$t('tags.description') + ' (' + store.currentProject.l1 + ')'"
                      v-model="refDashboard!.descriptionL1"
                      :isRequired="false"
                      :isDisabled="false"
                      :type="FieldType.TEXT"
                    ></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-5">
                    <InputField
                      :title="$t('tags.description') + ' (' + store.currentProject.l2 + ')'"
                      v-model="refDashboard!.descriptionL2"
                      :isRequired="false"
                      :isDisabled="false"
                      :type="FieldType.TEXT"
                    ></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-5">
                    <InputField
                      :title="$t('tags.description') + ' (' + store.currentProject.l3 + ')'"
                      v-model="refDashboard!.descriptionL3"
                      :isRequired="false"
                      :isDisabled="false"
                      :type="FieldType.TEXT"
                    ></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div class="sm:col-span-2">
                    <InputField
                      :title="$t('dashboards.type')"
                      v-model="refDashboard!.type"
                      :isRequired="false"
                      :isDisabled="false"
                      :choices="['Discovery', 'Continuum']"
                      :values="['Discovery', 'Continuum']"
                      :index-is-value="false"
                      :type="FieldType.SELECT"
                    ></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div class="sm:col-span-2">
                    <InputField
                      :title="$t('dashboards.imgBg')"
                      :upload-text="$t('projectInfos.uploadText')"
                      :drag-and-drop-text="$t('projectInfos.dragAndDropText')"
                      :type-and-size-text="$t('projectInfos.typeAndSizeText')"
                      id="imgBg"
                      v-model="refDashboard!.imgBg"
                      v-model:fileToUploadValue="imageToUpload"
                      :isRequired="false"
                      :type="FieldType.FILE"
                    ></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-5">
                    <InputField
                      :title="$t('dashboards.enableImgBg')"
                      v-model="refDashboard.enableImgBg"
                      :isRequired="false"
                      :isDisabled="false"
                      :type="FieldType.CHECKBOX"
                    ></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-5">
                    <InputFieldColorPicker
                      :title="$t('dashboards.colorBg')"
                      v-model="refDashboard.colorBg"
                    ></InputFieldColorPicker>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-5">
                    <InputField
                      :title="$t('tags.stared')"
                      v-model="refStared"
                      :isRequired="false"
                      :isDisabled="false"
                      :type="FieldType.CHECKBOX"
                    ></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-2">
                    <Btn :text="$t('save')" :primary="true" class=""></Btn>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, inject, onBeforeUpdate, ref, watch } from 'vue'
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from '../../store/Store'
import Btn from '../../components/Btn.vue'
import InputField from '../../components/InputField.vue'
import InputFieldColorPicker from '../../components/InputFieldColorPicker.vue'
import FieldType from '../../Contracts/FieldType'
import { BaseController, ModelCollection } from '../../Classes/BaseController'
import { RouteService } from '../../Classes/RouteService'
import { onUpdated } from 'vue'
import InputSwitch from '../../components/InputSwitch.vue'
import { SunIcon, PlayIcon } from '@heroicons/vue/outline'
import ComfirmPopup from '../../components/ComfirmPopup.vue'
import DashboardModel from '../../Models/DashboardModel'
import InputFieldColorPickerVue from '../../components/InputFieldColorPicker.vue'

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const breadCrumb = ref([{ name: 'Projects', href: '/projects' }])
const { t } = useI18n()

const warp10Url = import.meta.env.VITE_BACKEND_API_URL + '/warp10/' + route.params.id
const refDashboard = ref(new DashboardModel())

const refEdit = ref(false)
const refScript = ref('')
const refComfirmOpen = ref(false)
const refEditorSwitch = ref(false)
const refEditorLight = ref(false)
const refConfig = ref(
  '{"buttons" : {"class": ""},"execButton" : {"class": " m-3 border-gray-300 text-gray-500 flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white","label": "Executer"},"datavizButton" : {"class": "","label": "Visualize"},"hover" : false,"readOnly" : ' +
    String(!refEdit.value) +
    ',"messageClass" : "","errorClass" : "","editor": {"quickSuggestionsDelay": 10,"quickSuggestions": true,"tabSize": 2,"minLineNumber": 50,"enableDebug": false}}'
)
const refStared = ref(false)
const options = { httpHeaders: { Authorization: 'Bearer ' + store.authUser.token.token } }
let ws = ref('')

const refAppBodyHeight = ref(0)
const refAppBodyWidth = ref(0)

onUpdated(() => {
  getAppBodySize()
  window.addEventListener('resize', function (event) {
    getAppBodySize()
  })
  document
    .getElementById('wsEditor')!
    .addEventListener('warpViewEditorWarpscriptChanged', function (e: any) {
      refDashboard.value.body = e.detail
    })
})

let AppBodyHeight = computed(() => refAppBodyHeight.value - 20)

function getAppBodySize() {
  refAppBodyHeight.value = document.getElementById('appBody')!.clientHeight
  refAppBodyWidth.value = document.getElementById('appBody')!.clientWidth
}

const crudController = new BaseController<DashboardModel>(
  '/dashboards',
  [{ name: 'imgBg' }],
  refDashboard.value,
  store.authUser.token['token']
)

let imageToUpload = crudController.getFileList('imgBg')

crudController.setRoutePrefix(routePrefix)

function createDashboard() {
  const dashDiv = document.getElementById('hexa-dashboard')

  console.log(dashDiv)
}

async function init() {
  await RouteService.getProjectInfos(route)
  breadCrumb.value = [
    { name: 'Projects', href: '/projects' },
    { name: store.currentProject.name, href: routePrefix },
    { name: t('navigation.dashboards'), href: routePrefix + '/dashboards' },
    { name: t('dashboards.newDashboard'), href: routePrefix + '/dashboards/create' },
  ]
}
async function create() {
  refDashboard.value.stared = Number(refStared.value)
  await crudController.store(refDashboard.value)
  router.push(routePrefix + '/dashboards')
}
function toggleEdit() {
  if (refEditorSwitch.value == true) {
    refEditorSwitch.value = false
    refEdit.value = !refEdit.value
    setTimeout(() => (refEditorSwitch.value = true), 100)
  } else {
    refEdit.value = !refEdit.value
  }

  if (refEdit.value == false) {
    init()
  }
  refConfig.value =
    '{"buttons" : {"class": ""},"execButton" : {"class": " m-3 border-gray-300 text-gray-500 flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white","label": "Executer"},"datavizButton" : {"class": "","label": "Visualize"},"hover" : true,"readOnly" : ' +
    String(!refEdit.value) +
    ',"messageClass" : "","errorClass" : "","editor": {"quickSuggestionsDelay": 10,"quickSuggestions": true,"tabSize": 2,"minLineNumber": 50,"enableDebug": false}}'
}
function remove() {
  refEdit.value = false
  refComfirmOpen.value = true
}
async function removeConfirmation() {
  refComfirmOpen.value = false
  await crudController.remove(refDashboard.value.id)
  router.push(routePrefix + '/dashboards')
}
init()
</script>

<style>
/* Hide scrollbar for Chrome, Safari and Opera */
.logs::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.logs {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
