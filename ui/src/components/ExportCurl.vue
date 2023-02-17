<template>
    <div class="">
        <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
            <InputFieldDate
                :title="$t('projectInfos.exportInterval')"
                :range="true"
                v-model="refRange"
                :isRequired="false"
                @update:modelValue="updateCurl"
                class="col-span-6 md:col-span-3"
            ></InputFieldDate>

        </div>
        <span class="relative z-0 inline-flex shadow-sm rounded-md mt-3">
          <button @click="toogleIsLinux(true)" type="button" :class="[refIsLinux ? 'bg-gray-300': '', 'relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500']">Linux (CURL)</button>
          <button @click="toogleIsLinux(false)" type="button" :class="[refIsLinux ? '': 'bg-gray-300', '-ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500']">Windows (Invoke-WebRequest)</button>
        </span>
        <p class="mt-3 text-sm text-gray-500">{{ $t('projectInfos.dataExportMsg') }}</p>
        <div v-if="refIsLinux" class="bg-black  text-yellow-400 h-30 mt-2 w-full rounded-md p-2 overflow-x-auto">
            curl \ <br>
             -H 'X-Warp10-Token: {{props.readToken}}' \ <br>
             "{{appUrl}}/api/v0/fetch?start={{refStart}}&stop={{refEnd}}&selector=~.*%7B%7D&format=fulltext&dedup=false" > export.mc2
        </div>
        <div v-if="!refIsLinux" class="bg-black  text-yellow-400 h-30 mt-2 w-full rounded-md p-2 overflow-x-auto">
            Invoke-WebRequest -Headers @{"X-Warp10-Token"="{{props.readToken}}"} "{{appUrl}}/api/v0/fetch?start={{refStart}}&stop={{refEnd}}&selector=~.*%7B%7D&format=fulltext&dedup=false" -OutFile export.mc2
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { inject, ref } from 'vue';
import Store from '../store/Store'
import InputFieldDate from './InputFieldDate.vue';

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
    //refCurl.value='curl \ -H \'X-Warp10-Token: \'  \ "https://sandbox.senx.io/api/v0/fetch?start=' + encodeURI(refRange.value[0]) + '&stop=' + encodeURI(refRange.value[1]) + '&selector=~.*%7B%7D&format=fulltext&dedup=false"'
}
</script>
