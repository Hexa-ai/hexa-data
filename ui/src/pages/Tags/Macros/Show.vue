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
        <Btn
          v-if="edit"
          :text="$t('tags.exec')"
          :primary="false"
          :action="'play'"
          class="m-3"
          @click="play"
        ></Btn>
      </template>
      <template v-slot:menuRight class="p-3">
        <Btn
          v-if="edit == true && !refEditorSwitch"
          :text="$t('remove')"
          :primary="true"
          class="m-3"
          @click="remove"
        ></Btn>
        <Btn
          :text="edit == true ? $t('cancel') : $t('edit')"
          :primary="false"
          :action="edit == true ?'cancel':'update'"
          class="m-3"
          @click="toggleEdit"
        ></Btn>
        <Btn
          v-if="edit == true && refEditorSwitch"
          :text="'Sauvegarder'"
          :primary="false"
          class="m-3"
          @click="update"
        ></Btn>
      </template>
      <template v-slot:default>
        <ComfirmPopup
          :title="$t('tags.macroDeleteConfirmTitle')"
          :cancel-text="$t('cancel')"
          :confirm-text="$t('remove')"
          :msg="$t('tags.macroDeleteConfirmMsg')"
          @comfirm="removeConfirmation"
          v-model="refComfirmOpen"
        ></ComfirmPopup>
        <div :class="[!refEditorSwitch ? 'flex flex-col md:flex-row':'flex md:flex-row']" :style="'height: ' + refCodeHeight + 'px;'">
          <div class="flex-1">
            <form
              class="divide-gray-200 flex-grow h-full"
              action="#"
              method="POST"
              @submit.prevent="update"
            >
              <warp-view-editor
                ref="refWsEditor"
                v-show="refEditorSwitch"
                :url="warp10Url"
                id="wsEditor"
                :warpscript="refScript"
                :theme="refEditorLight == true ? 'light' : 'dark'"
                :horizontalLayout="false"
                :show-execute="false"
                :show-dataviz="false"
                :show-result="false"
                :display-messages="false"
                :config="refConfig"
              ></warp-view-editor>
              <div v-if="!refEditorSwitch" class="ml-5 mr-5 space-y-8 divide-y divide-gray-200">
                <div>
                  <div>
                    <h3
                      class="text-lg leading-6 font-medium text-gray-900"
                    >{{ $t('tags.parameters') }}</h3>
                    <p class="mt-1 text-sm text-gray-500"></p>
                  </div>
                  <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                    <div class="col-span-6 md:col-span-4">
                      <InputField
                        :title="$t('tags.name')"
                        v-model="refTag!.name"
                        :isRequired="true"
                        :isDisabled="!edit"
                        :type="FieldType.TEXT"
                      ></InputField>
                    </div>
                  </div>
                  <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                    <div class="col-span-6 md:col-span-5">
                      <InputField
                        :title="$t('tags.description') + ' (' + store.currentProject.l1 + ')'"
                        v-model="refTag!.descriptionL1"
                        :isRequired="false"
                        :isDisabled="!edit"
                        :type="FieldType.TEXT"
                      ></InputField>
                    </div>
                  </div>
                  <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                    <div class="col-span-6 md:col-span-5">
                      <InputField
                        :title="$t('tags.description') + ' (' + store.currentProject.l2 + ')'"
                        v-model="refTag!.descriptionL2"
                        :isRequired="false"
                        :isDisabled="!edit"
                        :type="FieldType.TEXT"
                      ></InputField>
                    </div>
                  </div>
                  <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                    <div class="col-span-6 md:col-span-5">
                      <InputField
                        :title="$t('tags.description') + ' (' + store.currentProject.l3 + ')'"
                        v-model="refTag!.descriptionL3"
                        :isRequired="false"
                        :isDisabled="!edit"
                        :type="FieldType.TEXT"
                      ></InputField>
                    </div>
                  </div>
                  <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                    <div class="col-span-6 md:col-span-4">
                      <InputField
                        class="pb-3"
                        :title="$t('tags.execInterval')"
                        v-model="refTag!.scriptInterval"
                        :isRequired="false"
                        :isDisabled="!edit"
                        :choices="[$t('tags.intervalDisabled'), $t('tags.interval30s'), $t('tags.interval1m'), $t('tags.interval10m'), $t('tags.interval30m'), $t('tags.interval60m'), $t('tags.interval24h')]"
                        :values="[0, 30, 60, 600, 1800, 3600, 86400]"
                        :index-is-value="false"
                        :type="FieldType.SELECT"
                      ></InputField>
                    </div>
                  </div>
                  <div v-if="edit" class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                    <div class="col-span-2">
                      <Btn :text="$t('save')" :primary="true" class=""></Btn>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div v-if="!refEditorSwitch" class="flex-1">
            <div>
              <div class="mt-3 mr-3 px-4 py-5 bg-white shadow rounded-lg overflow-hidden">
                <div class="mb-3">
                  <h3
                    class="text-lg leading-6 font-medium text-gray-900"
                  >{{ $t('tags.execLogs') }}</h3>
                  <p class="mt-1 text-sm text-gray-500"></p>
                </div>
                <div class="overflow-y-scroll h-72 bg-black pl-1 pr-1 rounded-md logs">
                  <div v-for="scriptOutput in refLogs" class="sm:col-span-5">
                    <div class="text-sm text-yellow-400">{{ scriptOutput.meta }}</div>
                    <div class="text-sm text-yellow-400">{{ scriptOutput.result }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-show="refEditorSwitch" id="warp10Debug" class="" :style="'padding:10px; width: 100%; height: ' + refDebugHeight + 'px;' ">
          <div id="warp10DebugLogs" class="w-full h-full logs overflow-y-scroll" style="background-color: #1E1E1E;">
            <div v-if="refWarp10Result!=''" :class="['w-full', 'text-white ml-3 mr-3 italic text-sm']"> Ops: {{refWarp10Ops}}, Fetched: {{refWarp10Fetched}}, Elapsed: {{refWarp10Elapsed}}<br/></div>
            <div  v-if="refWarp10ExecError" :class="['w-full', 'text-white ml-3 mr-3 italic text-sm']">Error line: {{refWarp10ErrorLine}} <br/></div>
            <div v-if="!refWarp10ExecError" v-for="line of refWarp10Result" :class="['w-full', 'text-white ml-3 mr-3']"> {{line}} <br/></div>
            <div v-if="refWarp10ExecError" :class="['w-full', 'text-yellow-600 ml-3 mr-3']"> {{refWarp10Result}} <br/></div>
          </div>

        </div>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, inject, onBeforeUpdate, ref, watch } from 'vue';
import BaseLayoutVue from '../../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from './../../../store/Store'
import TagModel from './../../../Models/TagModel';
import Btn from './../../../components/Btn.vue'
import InputField from './../../../components/InputField.vue';
import FieldType from './../../../Contracts/FieldType';
import { BaseController, ModelCollection } from './../../../Classes/BaseController'
import { RouteService } from '../../../Classes/RouteService'
import DeviceModel from '../../../Models/DeviceModel';
import { Utils } from '../../../Classes/Utils';
import EditorPopup from '../../../components/EditorPopup.vue'
import { onUpdated } from "vue";
import InputSwitch from './../../../components/InputSwitch.vue'
import { SunIcon, PlayIcon } from '@heroicons/vue/outline'
import ComfirmPopup from '../../../components/ComfirmPopup.vue'
import axios from 'axios';



const refEditorSwitch = ref(false)
const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const breadCrumb = ref([{ name: 'Projects', href: '/projects' }])
const { t } = useI18n()

const refTag = ref(new TagModel())

const warp10Url = window.location.origin + import.meta.env.VITE_API_PREFIX + '/warp10/' + route.params.id
const refWarp10Result = ref('')
const refWarp10ExecError = ref(false)
const refWarp10Fetched = ref()
const refWarp10Ops=ref()
const refWarp10ErrorLine=ref()
const refWarp10Elapsed=ref()






const edit = ref(false)
const refLogs = ref<any>()
const refScript = ref('')
const refComfirmOpen = ref(false)
const refEditorLight = ref(false)
const refConfig = ref('{"readOnly" : ' + String(!edit.value) + ', "editor": {"quickSuggestionsDelay": 10,"quickSuggestions": true}}')
const refWsEditor = ref(null)
const refAppBodyHeight =ref()
const refAppBodyWidth =ref()
const refCodeHeight=ref()
const refDebugHeight=ref()

onUpdated(() => {
  getAppBodySize()
  window.addEventListener('resize', function (event) {
    getAppBodySize()
  });
  document.getElementById('wsEditor')!.addEventListener('warpViewEditorWarpscriptChanged', function (e: any) {
    refTag.value.script = e.detail
  });

})

let AppBodyHeight = computed(() => refAppBodyHeight.value -20)

function getAppBodySize() {
  refAppBodyHeight.value = document.getElementById('page')!.clientHeight - 128
  refCodeHeight.value=3/4*refAppBodyHeight.value
  refDebugHeight.value=1/4*refAppBodyHeight.value
  refAppBodyWidth.value = document.getElementById('appBody')!.clientWidth
}

async function play(){
  const res = await axios.post(warp10Url,refTag.value.script,{headers:{ Authorization: `Bearer ${store.authUser.token['token']}` }})

  refWarp10Fetched.value =res.headers['x-warp10-fetched']
  refWarp10Ops.value=res.headers['x-warp10-ops']
  refWarp10ErrorLine.value=res.headers['x-warp10-error-line']
  refWarp10Elapsed.value=res.headers['x-warp10-elapsed']

  if (res.headers['x-warp10-error-message']!=undefined){
    refWarp10ExecError.value=true
    refWarp10Result.value=res.headers['x-warp10-error-message']
  } else {
    refWarp10ExecError.value=false
    refWarp10Result.value=res.data
  }
  document.getElementById('warp10DebugLogs')!.scrollTo(0,0)
}

const crudController = new BaseController<TagModel>(
  '/tags',
  [],
  refTag.value,
  store.authUser.token['token'],
)

crudController.setRoutePrefix(routePrefix)



async function init() {
  await RouteService.getProjectInfos(route)
  refTag.value = await crudController.show(Number(route.params.tagId))
  refScript.value = refTag.value.script
  refLogs.value = JSON.parse(refTag.value.scriptOutput)

  breadCrumb.value = [
    { name: 'Projects', href: '/projects' },
    { name: store.currentProject.name, href: routePrefix },
    { name: t('navigation.macros'), href: routePrefix + '/macros' },
  ]

  const splittedName = refTag.value.name.split('.')
  if (splittedName.length > 1) {
    breadCrumb.value.push({ name: splittedName[0], href: routePrefix + '/macros?namespace=' + splittedName[0] })
  }

  breadCrumb.value.push({ name: refTag.value.name, href: routePrefix + '/macros/' + refTag.value.id })
}
async function update() {
  await crudController.update(refTag.value, true)
  toggleEdit()
  init()
}
function toggleEdit() {
  if (refEditorSwitch.value == true) {
    refEditorSwitch.value = false
    edit.value = !edit.value
    setTimeout(() => refEditorSwitch.value = true, 100)
  } else {
    edit.value = !edit.value
  }

  if (edit.value == false) {
    init()
  }
  refConfig.value = '{"readOnly" : ' + String(!edit.value) + ',"editor": {"quickSuggestionsDelay": 10,"quickSuggestions": true}}'


}
function remove() {
  edit.value = false
  refComfirmOpen.value = true
}
async function removeConfirmation() {
  refComfirmOpen.value = false
  await crudController.remove(refTag.value.id)
  router.push(routePrefix + '/macros')
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
