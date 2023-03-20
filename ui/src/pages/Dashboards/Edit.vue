<template>
  <div id="page" class="h-full">
    <BaseLayoutVue
      :pages-bread-crumb="breadCrumb"
      :show-tool-bar="true"
      :bgColor="refEditorSwitch==true && refDashboard.type=='Continuum' ? refDashboard.colorBg:'white'"
      :enableImgBg="refEditorSwitch==true && refDashboard.type=='Continuum'? refDashboard.enableImgBg:undefined"
      :imgBgUrl="refEditorSwitch==true && refDashboard.type=='Continuum' ? refImgBgUrl:undefined"
      class="h-full">
      <template v-slot:menuTopRight>
        <div v-show="refEditorSwitch" class="flex grow flex-col items-end" >
          <InputFieldDateWarp
          class="w-4/5"
          :dateRange="initialDateRange"
          :baseUrl="refWarp10BaseUrl"
          @update:outputUrl="updateDashboardUrl"
          ></InputFieldDateWarp>
        </div>
      </template>
      <template v-slot:menuLeft>
        <InputSwitch class="ml-3" :text1="refDashboard.type == 'Discovery' ? $t('tags.warpScriptEditor') : $t('dashboards.continuumDesigner')" :text2="''" v-model="refEditorSwitch">
        </InputSwitch>
        <InputSwitch v-if="refEditorSwitch" class="ml-3" :text1="$t('dashboards.float')" :text2="''" v-model="refFloatSwitch">
        </InputSwitch>
        <a :href="routePrefix + '/dashboards/' + route.params.dashboardId"
          onclick="window.open(this.href); return false;"
          class="m-3 border-gray-300 text-gray-500 flex justify-center py-2 px-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2">
          <PlayIcon class="mr-1 flex-shrink-0 m-0 h-5 w-5 text-gray-400" aria-hidden="true" />
          {{ ' ' + $t('dashboards.preview') }}
        </a>
      </template>
      <template v-slot:menuRight class="p-3">
        <label
          v-if="(store.authUser.projectRole==RoleType.EDITOR || store.authUser.isAdmin==1 || store.currentProject.owner.id==store.authUser.id) && refEdit == true && !refEditorSwitch"
          class="border-gray-300 text-gray-500 m-3 has-tooltip flex justify-center py-2 px-3 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2">
          <input class="hidden" type="file" @change="importDashboard"/>
            <UploadIcon class="flex-shrink-0 h-5 w-5 text-gray-400"></UploadIcon>
            <span class='tooltip bg-black p-2 mt-9 rounded-md text-white'>{{$t('dashboard.import')}}</span>
        </label>
        <Btn
          v-if="(store.authUser.projectRole==RoleType.EDITOR || store.authUser.isAdmin==1 || store.currentProject.owner.id==store.authUser.id) && refEdit == true && !refEditorSwitch"
          :text="$t('dashboard.export')" :primary="false" :action="'download'" class="m-3" @click="exportDashboard"></Btn>
        <Btn v-if="refEdit == true && refEditorSwitch" :text="$t('new')" :primary="false" class="m-3" @click="addWidget">
        </Btn>
        <Btn v-if="refEdit == true && !refEditorSwitch" :text="$t('remove')" :primary="true" class="m-3"
          @click="remove"></Btn>
        <Btn :text="refEdit == true ? $t('cancel') : $t('edit')" :action="refEdit == true ? 'cancel' : 'update'"
          :primary="false" class="m-3" @click="toggleEdit"></Btn>
        <Btn v-if="refEdit == true && refEditorSwitch" :text="$t('save')" :primary="false" class="m-3"
          @click="save"></Btn>
      </template>
      <template v-slot:default>
        <ComfirmPopup :title="$t('tags.macroDeleteConfirmTitle')" :cancel-text="$t('cancel')"
          :confirm-text="$t('remove')" :msg="$t('tags.macroDeleteConfirmMsg')" @comfirm="removeConfirmation"
          v-model="refComfirmOpen"></ComfirmPopup>
        <div class="h-fit flex" :style="refEditorSwitch && refDashboard.type=='Discovery' ? 'height: ' + refCodeHeight + 'px;':''">
          <form class="divide-gray-200 flex-grow h-fit" action="#" method="POST" @submit.prevent="saveDiscovery">
            <div v-if="refEditorSwitch && refDashboard.type=='Continuum'" class="hexa-dashboard pt-6 h-fit">
              <DashboardGrid
                class="continuum-dashboard z-1"
                :edit="refEdit"
                :url="refWarp10Url"
                :float="refFloatSwitch"
                :data="refDashboard"
                v-model:save="refSave"
                v-model:add="refAdd"
                @save="saveContinuum"
              ></DashboardGrid>
            </div>
            <warp-view-editor
              v-show="refEditorSwitch && refDashboard.type=='Discovery'"
              url=""
              id="wsEditor"
              :warpscript="refScript"
              :theme="'dark'"
              :horizontalLayout="true"
              :show-execute="false"
              :show-dataviz="false"
              :show-result="false"
              :display-messages="true"
              :config="refConfig"
            ></warp-view-editor>
            <div v-if="!refEditorSwitch" class="ml-5 mr-5 space-y-8 divide-y divide-gray-200">
              <div>
                <div>
                  <h3 class="text-lg leading-6 font-medium text-gray-900">{{ $t('tags.parameters') }}</h3>
                  <p class="mt-1 text-sm text-gray-500"></p>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-2">
                    <InputField :title="$t('tags.name')" v-model="refDashboard!.name" :isRequired="true"
                      :isDisabled="!refEdit" :type="FieldType.TEXT"></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-6">
                    <InputField :title="$t('tags.description') + ' (' + store.currentProject.l1 + ')'"
                      v-model="refDashboard!.descriptionL1" :isRequired="false" :isDisabled="!refEdit"
                      :type="FieldType.TEXT"></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-6">
                    <InputField :title="$t('tags.description') + ' (' + store.currentProject.l2 + ')'"
                      v-model="refDashboard!.descriptionL2" :isRequired="false" :isDisabled="!refEdit"
                      :type="FieldType.TEXT"></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-6">
                    <InputField :title="$t('tags.description') + ' (' + store.currentProject.l3 + ')'"
                      v-model="refDashboard!.descriptionL3" :isRequired="false" :isDisabled="!refEdit"
                      :type="FieldType.TEXT"></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div class="sm:col-span-2">
                    <InputField :title="$t('dashboards.type')" v-model="refDashboard!.type" :isRequired="false"
                      :isDisabled="!refEdit" :choices="['Discovery', 'Continuum']" :values="['Discovery', 'Continuum']"
                      :index-is-value="false" :type="FieldType.SELECT"></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div class="sm:col-span-2">
                    <InputField :title="$t('dashboards.imgBg')" :upload-text="$t('projectInfos.uploadText')"
                      :drag-and-drop-text="$t('projectInfos.dragAndDropText')"
                      :type-and-size-text="$t('projectInfos.typeAndSizeText')" id="imgBg" v-model="refDashboard!.imgBg"
                      v-model:fileToUploadValue="imageToUpload" :isRequired="false" :isDisabled="!refEdit"
                      :type="FieldType.FILE"></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-5">
                    <InputField :title="$t('dashboards.enableImgBg')" v-model="refEnableImgBg" :isRequired="false"
                      :isDisabled="!refEdit" :type="FieldType.CHECKBOX"></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-5">
                    <InputFieldColorPicker :title="$t('dashboards.colorBg')" v-model="refDashboard.colorBg"
                      :isDisabled="!refEdit"></InputFieldColorPicker>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-5">
                    <InputField :title="$t('tags.stared')" v-model="refStared" :isRequired="false"
                      :isDisabled="!refEdit" :type="FieldType.CHECKBOX"></InputField>
                  </div>
                </div>
                <div v-if="refEdit" class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
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
import { computed, inject, onBeforeUpdate, ref, watch } from 'vue';
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from './../../store/Store'
import Btn from './../../components/Btn.vue'
import InputField from './../../components/InputField.vue';
import FieldType from './../../Contracts/FieldType';
import { BaseController, ModelCollection } from './../../Classes/BaseController'
import { RouteService } from '../../Classes/RouteService'
import { onUpdated } from "vue";
import InputSwitch from './../../components/InputSwitch.vue'
import { SunIcon, PlayIcon, UploadIcon } from '@heroicons/vue/outline'
import ComfirmPopup from '../../components/ComfirmPopup.vue'
import DashboardModel from '../../Models/DashboardModel';
import DashboardModelBackend from '../../Models/DashboardModelBackend'
import InputFieldColorPicker from '../../components/InputFieldColorPicker.vue';
import DashboardGrid from "./../../components/DashboardGrid.vue";
import TileModel from '../../Models/TileModel';
import InputFieldDateWarp from '../../components/InputFieldDateWarp.vue';
import RoleType from '../../Contracts/RoleType';

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const breadCrumb = ref([{ name: 'Projects', href: '/projects' }])
const { t } = useI18n()

const qs=window.location.search
const refWarp10BaseUrl = ref(window.location.origin + import.meta.env.VITE_API_PREFIX + '/warp10/' + route.params.id + qs)
const refWarp10Url = ref('')
const refImgBgUrl = ref('')
let refDashboardBackend = ref(new DashboardModelBackend())
let refDashboard = ref(new DashboardModel())
const refIsMobile = ref(false)
const refEdit = ref(false)
const refAdd = ref(false);
const refSave = ref(false);
const refScript = ref("")
const refComfirmOpen = ref(false)
const refFloatSwitch = ref(false)
const refEditorSwitch = ref(false)
const refConfig = ref('{"readOnly" : ' + String(!refEdit.value) + ',"editor": {"quickSuggestionsDelay": 10,"quickSuggestions": true}}')
const refStared = ref(false)
const refEnableImgBg = ref(false)
const refAppBodyHeight = ref(0)
const refCodeHeight=ref()

const initialDateStart = new Date();
initialDateStart.setHours(initialDateStart.getHours()-1)
const initialDateEnd = new Date();
const initialDateRange=ref<[string , string]>(store.memoDateRange[0]=='' && store.memoDateRange[1]=='' ?[initialDateStart.toISOString(),initialDateEnd.toISOString()]:store.memoDateRange)

const crudController = new BaseController<DashboardModelBackend>(
  '/dashboards',
  [{ name: 'imgBg' }],
  refDashboardBackend.value,
  store.authUser.token['token'],
)
let imageToUpload = crudController.getFileList('imgBg')
crudController.setRoutePrefix(routePrefix)

onUpdated(() => {
  getAppBodySize()
  window.addEventListener('resize', function (event) {
    getAppBodySize()
  });
  document.getElementById('wsEditor')!.addEventListener('warpViewEditorWarpscriptChanged', function (e: any) {
    refDashboard.value.body = e.detail
  });

})

function updateDashboardUrl(dateRange:any){
  refWarp10Url.value=dateRange.url
  store.memoDateRange=dateRange.dateRange
}

function getAppBodySize() {
  if (document.getElementById('appBody')!.clientWidth>768){
    refIsMobile.value=false
  } else {
    refIsMobile.value=true
  }

  refAppBodyHeight.value = document.getElementById('appBody')!.clientHeight - 128
  refCodeHeight.value=0.97*refAppBodyHeight.value
}

function addWidget() {
  refAdd.value=true
}

function createDashboard() {
  const dashDiv = document.getElementById('hexa-dashboard')
  console.log(dashDiv)
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
  refDashboardBackend.value.imgBg!=null?refImgBgUrl.value = refDashboardBackend.value.imgBg.url:refImgBgUrl.value=""
  refDashboard.value.name = refDashboardBackend.value.name
  refDashboard.value.stared = refDashboardBackend.value.stared
  refDashboard.value.type = refDashboardBackend.value.type

  if (refDashboard.value.type == 'Continuum') {
    const bodyObj = JSON.parse(refDashboard.value.body)
    if (bodyObj=='' || bodyObj==null) {
      refDashboard.value.tiles = [new TileModel()]
    } else {
      refDashboard.value.tiles=bodyObj.tiles
      refDashboard.value.float=bodyObj.float
      refFloatSwitch.value=bodyObj.float
    }

  } else {
    refScript.value = refDashboard.value.body
  }

  refStared.value = Boolean(refDashboard.value.stared)
  refEnableImgBg.value = Boolean(refDashboard.value.enableImgBg)
  breadCrumb.value = [{ name: 'Projects', href: '/projects' }, { name: store.currentProject.name, href: routePrefix }, { name: t('navigation.dashboards'), href: routePrefix + '/dashboards' }, { name: refDashboard.value.name, href: routePrefix + '/dashboards/' + refDashboard.value.id }]
}
async function save(){
  if (refDashboard.value.type=='Discovery') {
    saveDiscovery()
  } else {
    refSave.value=true;
  }
}

async function saveDiscovery() {

  refDashboardBackend.value.body=refDashboard.value.body
  refDashboardBackend.value.colorBg=refDashboard.value.colorBg
  refDashboardBackend.value.descriptionL1=refDashboard.value.descriptionL1
  refDashboardBackend.value.descriptionL2=refDashboard.value.descriptionL2
  refDashboardBackend.value.descriptionL3=refDashboard.value.descriptionL3
  refDashboardBackend.value.enableImgBg=Number(refEnableImgBg.value)
  refDashboardBackend.value.id=refDashboard.value.id
  refDashboardBackend.value.imgBg=refDashboard.value.imgBg
  refDashboardBackend.value.name=refDashboard.value.name
  refDashboardBackend.value.stared=Number(refStared.value)
  refDashboardBackend.value.type=refDashboard.value.type
  await crudController.update(refDashboardBackend.value, true)

  refEdit.value = false
  init()
}

async function saveContinuum(data:DashboardModel) {

  let tempDataTiles = []
  const countDataTiles = data.tiles.length
  let j =0
  for (let i = 0 ; i < countDataTiles ; i++){
    if(data.tiles[i]!=undefined){
      tempDataTiles[j]=data.tiles[i]
      j++
    }
  }
  data.tiles = tempDataTiles
  refDashboardBackend.value.body=JSON.stringify({tiles:data.tiles, float:data.float})
  refDashboardBackend.value.colorBg=refDashboard.value.colorBg
  refDashboardBackend.value.descriptionL1=refDashboard.value.descriptionL1
  refDashboardBackend.value.descriptionL2=refDashboard.value.descriptionL2
  refDashboardBackend.value.descriptionL3=refDashboard.value.descriptionL3
  refDashboardBackend.value.enableImgBg=Number(refEnableImgBg.value)
  refDashboardBackend.value.id=refDashboard.value.id
  refDashboardBackend.value.imgBg=refDashboard.value.imgBg
  refDashboardBackend.value.name=refDashboard.value.name
  refDashboardBackend.value.stared=Number(refStared.value)
  refDashboardBackend.value.type=refDashboard.value.type

  await crudController.update(refDashboardBackend.value, true)
  refEdit.value = false
  init()
}
async function importDashboard(e:Event) {
  const target = e.target as HTMLInputElement
  //const fileContent = await this.readFile(await target.files![0])
  console.log(await (await target.files![0]).text())
  refDashboard.value.body=await (await target.files![0]).text()
}
function exportDashboard() {
  const file = new Blob([refDashboard.value.body], { type: 'application/json' });

  const a = document.createElement("a")
  const fileUrl = URL.createObjectURL(file)
  a.href = fileUrl;
  a.download = 'dashboard.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(fileUrl);
  }, 0);
}
function toggleEdit() {
  refEdit.value = !refEdit.value
  refConfig.value = '{"buttons" : {"class": ""},"execButton" : {"class": " m-3 border-gray-300 text-gray-500 flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white","label": "Executer"},"datavizButton" : {"class": "","label": "Visualize"},"hover" : true,"readOnly" : ' + String(!refEdit.value) + ',"messageClass" : "","errorClass" : "","editor": {"quickSuggestionsDelay": 10,"quickSuggestions": true,"tabSize": 2,"minLineNumber": 50,"enableDebug": false}}'
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
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}
.hexa-dashboard {
  --warp-view-pagination-bg-color    :white;
  --warp-view-pagination-disabled-color:white;
  --warp-view-pagination-active-bg-color:v-bind(store.publicAppSettings.appMenuBgCurrentBodyColor);
  --warp-view-pagination-active-color:v-bind(store.publicAppSettings.appMenuFontOverBodyColor);
  --warp-view-pagination-hover-bg-color:rgb(209 213 219);
  --warp-view-datagrid-even-bg-color:rgb(209 213 219);
}
</style>

