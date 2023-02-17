<template>
    <div class="">
        <span class="relative z-0 inline-flex shadow-sm rounded-md mt-3">
          <button @click="toogleIsLinux(true)" type="button" :class="[refIsLinux ? 'bg-gray-300': '', 'relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500']">Linux (CURL)</button>
          <button @click="toogleIsLinux(false)" type="button" :class="[refIsLinux ? '': 'bg-gray-300', '-ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500']">Windows (Invoke-WebRequest)</button>
        </span>
        <p class="mt-3 text-sm text-gray-500">{{ $t('projectInfos.dataExportMsg') }}</p>
        <div v-if="refIsLinux" class="bg-black  text-yellow-400 h-30 mt-2 w-full rounded-md p-2 overflow-x-auto">
            curl -H 'X-Warp10-Token: {{props.writeToken}}' \ <br>
            -H 'Transfer-Encoding: chunked' -T 'export.mc2' '{{appUrl}}/api/v0/update'
        </div>
        <div v-if="!refIsLinux" class="bg-black  text-yellow-400 h-30 mt-2 w-full rounded-md p-2 overflow-x-auto">
        Invoke-WebRequest -Headers @{"X-Warp10-Token"="{{props.writeToken}}"} "{{appUrl}}/api/v0/update" -Method Post -Infile export.mc2
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { inject, ref } from 'vue';
import Store from '../store/Store'
import InputFieldDate from './InputFieldDate.vue';
import Btn from './Btn.vue';

const store: Store = inject('store')!

const props = defineProps<{
  readToken: string,
  writeToken: string,
}>()


const refIsLinux=ref(false)
const refRange=ref(['',''])
const refStart=ref()
const refEnd=ref()
const appUrl=import.meta.env.VITE_WARP10_EXTERNAL_URL
const refCurl=ref('')

function toogleIsLinux(state:boolean){
  refIsLinux.value=state
}

function updateCurl(){
    refStart.value=encodeURI(refRange.value[0])
    refEnd.value=encodeURI(refRange.value[1])
}
</script>
