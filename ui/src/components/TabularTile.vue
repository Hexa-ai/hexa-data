<template>
  <div style="height: 30rem;" class="disabled:opacity-75 pb-20 pt-5 pl-5 pr-5 bg-white shadow rounded-lg mb-5 mt-5">
    <InputFideldDate
      title="Interval"
      :range="true"
      v-model="datePickerRange"
      :isRequired="false"
      @update:modelValue="update"
      class="mb-3"
    ></InputFideldDate>

    <ul id="list" role="list" class="-mb-8 h-full overflow-y-scroll">
      <li v-for="(row, index) of refData" :key="index">
<div class="relative pb-8">
          <span v-if="index !== refData.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
          <div class="relative flex space-x-3">
            <div>
                <span :class="['bg-gray-400', 'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white']">
                    <component :is="AnnotationIcon" class="h-5 w-5 text-white" aria-hidden="true" />
                </span>
            </div>
            <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
              <div>
                <p class="text-sm text-gray-500">
                  {{row[1]}}
                </p>
              </div>
              <div class="text-right text-sm whitespace-nowrap text-gray-500">
                <time :datetime="row[0]">{{ (new Date(Number(row[0])/1000)).toLocaleDateString('fr') + ' - ' + (new Date(Number(row[0])/1000)).toLocaleTimeString('fr')}}</time>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>

  </div>
</template>


<script setup lang="ts">
import axios, { AxiosRequestConfig } from 'axios'
import { AnnotationIcon } from '@heroicons/vue/solid'
import { inject, ref } from 'vue'
import Store from './../store/Store'
import InputFideldDate from './InputFieldDate.vue'

const store: Store = inject('store')!

const props = defineProps<{
  url:string,
  datePicker:boolean
  script:string
}>()

let conf:AxiosRequestConfig<any>= {headers:{ Authorization: `Bearer ${store.authUser.token.token}` }}

let refUrl = ref('')
let refData = ref([])

const initialDateStart = new Date()
initialDateStart.setDate(initialDateStart.getDate()-1)

var initialDateEnd = new Date()

initialDateEnd.toISOString
let datePickerRange=ref<string | [string , string]>([initialDateStart.toISOString(),initialDateEnd.toISOString()])
let dateRange=ref({start: initialDateStart.toISOString(), end:initialDateEnd.toISOString()})


function init(){
  getFullUrl()
  const daterangeInit = [dateRange.value.start, dateRange.value.end]
  update(daterangeInit)
}
function update(e:string | string[]){
  dateRange.value.start=e[0]
  dateRange.value.end=e[1]

  datePickerRange.value=[e[0],e[1]]
  getFullUrl()
  const res = axios.post(refUrl.value,props.script, conf)

  res.then(function (response) {
    console.log(response)
    refData.value = response.data
  })
}
function getFullUrl() {
  if (props.datePicker==true) {
    if (props.url.indexOf('?')>0) {
    refUrl.value = props.url + '&' + getQs()
    } else {
    refUrl.value = props.url + '?' + getQs()
    }
  } else {
    refUrl.value=props.url
  }

}
function getQs(): string{
  let qs:string=''
  for (const key in Object.keys(dateRange.value)){
    if ( Number(key) < Object.keys(dateRange.value).length-1){
      qs=qs + Object.keys(dateRange.value)[key] + '=' + Object.values(dateRange.value)[key] + '&'
    } else {
      qs=qs + Object.keys(dateRange.value)[key] + '=' + Object.values(dateRange.value)[key]
    }
  }

  return qs
}

init()
</script>
<style>
/* hide scrollbar but allow scrolling */
#list {
    -ms-overflow-style: none; /* for Internet Explorer, Edge */
    scrollbar-width: none; /* for Firefox */
    overflow-y: scroll;
}

#list::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
}
</style>
