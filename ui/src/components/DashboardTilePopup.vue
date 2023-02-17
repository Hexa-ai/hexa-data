<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" @close="closeModal">
      <div class="fixed w-full pl-52 pr-52 inset-0 z-10 overflow-y-auto">
        <div class="min-h-screen px-4 text-center">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
            leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
            <DialogOverlay class="fixed inset-0" />
          </TransitionChild>

          <span class="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95">
            <div
              class="w-full inline-block p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white border-2 border-gray-200 shadow-xl rounded-2xl">
              <div class="flex flex-row">
                <div class="basis-2/4">
                  <div class="flex-col">
                    <div class="pt-2">
                      <InputField :title="$t('projectInfos.title') + (' (' + store.currentProject.l1 +')')" v-model="refData.L1"
                        :isRequired="false" :isDisabled="false" :type="FieldType.TEXT">
                      </InputField>
                    </div>
                    <div class="pt-2">
                      <InputField :title="$t('projectInfos.title') + (' (' + store.currentProject.l2 +')')" v-model="refData.L2"
                        :isRequired="false" :isDisabled="false" :type="FieldType.TEXT">
                      </InputField>
                    </div>
                    <div class="pt-2">
                      <InputField :title="$t('projectInfos.title') + (' (' + store.currentProject.l3 +')')" v-model="refData.L3"
                        :isRequired="false" :isDisabled="false" :type="FieldType.TEXT">
                      </InputField>
                    </div>
                    <div>
                      <div class="pt-2">
                        <span class="relative z-0 inline-flex shadow-sm rounded-md mt-3">
                          <button @click="justify('left')" type="button" :class="[refData.headerJustify=='left' ? 'bg-gray-300': '', 'relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700  focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500']"><MenuAlt2Icon class="flex-shrink-0 h-5 w-5 text-gray-400"></MenuAlt2Icon></button>
                          <button @click="justify('center')" type="button" :class="[refData.headerJustify=='center' ? 'bg-gray-300': '', '-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700  focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500']"><MenuIcon class="flex-shrink-0 h-5 w-5 text-gray-400"></MenuIcon></button>
                          <button @click="justify('right')" type="button" :class="[refData.headerJustify=='right' ? 'bg-gray-300': '', '-ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500']"><MenuAlt3Icon class="flex-shrink-0 h-5 w-5 text-gray-400"></MenuAlt3Icon></button>
                        </span>
                        <InputFieldColorPicker
                          class="mt-3"
                          :title="$t('dashboards.titleColor')"
                          v-model="refData.headerColor"
                        :isDisabled="false"
                        ></InputFieldColorPicker>
                      </div>
                    </div>
                    <div>
                      <div class="pt-2">
                        <InputFieldColorPicker
                          class="mt-3"
                          :title="$t('dashboards.colorBg')"
                          v-model="refData.bgColor"
                        :isDisabled="false"
                        ></InputFieldColorPicker>
                      </div>
                    </div>
                    <div class="pt-2 flex">
                      <InputField  class="basis-1/2" :title="$t('dashboards.autoRefresh')" v-model="refData.autoRefresh"
                        :isRequired="false" :isDisabled="false" :choices="['none', '1s', '5s', '10s', '15s', '30s', '1min', '5min', '10min', '30min', '1h']" :index-is-value="false"
                        :values="[-1, 1, 5, 10, 15, 30, 60, 300, 600, 1800, 3600]" :type="FieldType.SELECT">
                      </InputField>
                    </div>
                    <div class="pt-2 flex items-end">
                      <InputField  class="basis-1/2" :title="$t('dashboards.type')" v-model="refData.chartType"
                        :isRequired="false" :isDisabled="false" :choices="chartType" :index-is-value="false"
                        :values="chartType" :type="FieldType.SELECT"
                        @change="onChangeChartType">
                      </InputField>

                      <Btn class="ml-5" :primary="false" :text="$t('initTemplate')" v-if="refData.showInitializeTemplate" @click="initializeTemplate" action="generate" />
                    </div>
                    <div class="pt-2">
                      <InputField :title="'EventHandler'" v-model="refData.eventHandler"
                        :isRequired="false" :isDisabled="false" :type="FieldType.TEXT">
                      </InputField>
                    </div>
                    <div class="pt-2">
                      <InputField :title="'Vars'" v-model="refData.vars"
                        :isRequired="false" :isDisabled="false" :type="FieldType.TEXT">
                      </InputField>
                    </div>
                    <div>
                      <div class="pt-2">
                        <InputField :title="$t('dashboards.showOutline')" v-model="refData.showOutLine" :isRequired="false"
                          :isDisabled="false" :type="FieldType.CHECKBOX">
                        </InputField>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="basis-3/4 pb-3 h-full">
                  <div class="h-full">
                    <warp-view-editor url="https://warp.senx.io/api/v0/exec" height-px=600 width-px=600 theme="dark"
                      id="wsContinuumEditor" :warpscript="refData.script" show-dataviz="false" show-result="false"
                      show-execute="false" config='{"quickSuggestionsDelay":3000, "suggestOnTriggerCharacters": false}'>
                    </warp-view-editor>
                  </div>
                </div>
              </div>
              <div class="flex justify-end">
                <div>
                  <Btn class="ml-5" :primary="false" :text="$t('cancel')" @click="cancelation"></Btn>
                </div>
                <div>
                  <Btn class="ml-5" :primary="false" :text="$t('save')" @click="confirm"></Btn>
                </div>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, inject, onUpdated, onMounted } from 'vue';
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay } from '@headlessui/vue';
import Btn from './Btn.vue';
import TileModel from '../Models/TileModel';
import Store from '../store/Store';
import FieldType from '../Contracts/FieldType';
import InputField from './InputField.vue';
import { chartType } from '../Contracts/ChartType';
import { MenuAlt2Icon, MenuIcon, MenuAlt3Icon } from '@heroicons/vue/outline'
import InputFieldColorPicker from './InputFieldColorPicker.vue';
import axios from 'axios';
import { reactive } from 'vue'

const store: Store = inject('store')!

const emits = defineEmits(['update:modelValue', 'update:data'])
const refData = ref<TileModel>(new TileModel())

let scriptToSave = ''

const props = defineProps<{
  data: TileModel
  modelValue: boolean
}>()

function confirm() {
  if(scriptToSave!=''){
    refData.value.script=scriptToSave
  }
  emits('update:modelValue', false)
  emits('update:data', refData.value)

}

function closeModal() {
  emits('update:modelValue', false)
}

function cancelation() {
  emits('update:modelValue', false)
}

function init() {
  refData.value = JSON.parse(JSON.stringify(props.data))
}
function justify(value:string){
  refData.value.headerJustify=value
}
onUpdated(() => {
  if(props.modelValue==true){
    setTimeout(()=>{
    document.getElementById('wsContinuumEditor')!.addEventListener('warpViewEditorWarpscriptChanged', function (e: any) {
      console.log("nouvelle saisie")
      scriptToSave = e.detail
    });
  },500)
  }
})

async function fetchScriptForType(type: string): Promise<string> {
  try {
    const {tile} = await import(`../templates/${type}.ts`)
    console.log({tile})
    return tile.script
  } catch (error) {
    return ""
  }
}

async function onChangeChartType(event: Event) {
  if (refData.value.script !== "") {
    refData.value.showInitializeTemplate = true
    return
  }

  const target = event.target as HTMLInputElement
  const type = target.value
  const script = await fetchScriptForType(type)
  if (script) {
    refData.value.script = script
  }
}

async function initializeTemplate() {
  const type = refData.value.chartType
  const script = await fetchScriptForType(type)
  if (script) {
    refData.value.script = script
  }
}

init()

</script>
