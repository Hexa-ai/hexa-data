<template>
  <div style="height: 30rem;" class="disabled:opacity-75 pb-20 pt-5 pl-5 pr-5 bg-white shadow rounded-lg mb-5 mt-5">
    <InputFieldDate
      title="Interval"
      :range="true"
      v-model="datePickerRange"
      :isRequired="false"
      @update:modelValue="update"
      class="mb-3"
    ></InputFieldDate>
    <div class="flex flex-row h-full">
      <discovery-tile v-if="warpScript!='' && refUrl!=''" :id="tileId" :url="refUrl" :options="{'httpHeaders': { 'Authorization': 'Bearer ' + store.authUser.token.token }, 'showRangeSelector':true, 'autoRefresh':autoRefresh, 'timeZone':'AUTO'}" :type="type">
        {{warpScript}}
      </discovery-tile>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import Store from './../store/Store'
import InputFieldDate from './InputFieldDate.vue'

const store: Store = inject('store')!

const props = defineProps<{
  tileId:string,
  title?:string,
  type:String,
  url:string,
  datePicker:boolea,
  warpScript:string,
}>()


let refUrl = ref('')

const initialDateStart = new Date();
initialDateStart.setHours(initialDateStart.getHours()-1)

var initialDateEnd = new Date();

initialDateEnd.toISOString
const datePickerRange=ref<string | [string , string]>([initialDateStart.toISOString(),initialDateEnd.toISOString()])
const dateRange=ref({start: initialDateStart.toISOString(), end:initialDateEnd.toISOString()})

const autoRefresh = computed(() =>{
  if (new Date(datePickerRange.value[1])>new Date()) {
    return 1
  } else {
    return 0
  }
});

function init(){
  getFullUrl()
}
function update(e:string | [string , string]){
  dateRange.value.start=e[0]
  dateRange.value.end=e[1]

  datePickerRange.value=[e[0],e[1]]
  getFullUrl()
  const chartElm = document.getElementById(props.tileId)
  chartElm!.exec(true)
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
/* discovery-tile .discovery-tile-spinner {
  position: relative;
} */

</style>
