<template>
  <InputFieldDate title="" :range="true" v-model="refDateRange" :isRequired="false" @update:model-value="getFullUrl" class=""></InputFieldDate>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import InputFieldDate from './InputFieldDate.vue'

const emits = defineEmits(['update:outputUrl'])

const qs = window.location.search
const refDateRange = ref<string | [string, string]>('')
const props = defineProps<{
  baseUrl: string
  dateRange: string | [string, string]
}>()

function init() {
  refDateRange.value = props.dateRange
  getFullUrl(props.dateRange)

}
function getQs(dateRange: string | [string, string]): string {
  let qs: string = ''
  for (const key in Object.keys(dateRange)) {
    if (Number(key) < Object.keys(dateRange).length - 1) {
      qs = qs + 'dtStart' + '=' + String((new Date(Object.values(dateRange)[key])).getTime()*1000) + '&'
    } else {
      qs = qs + 'dtEnd' + '=' + String((new Date(Object.values(dateRange)[key])).getTime()*1000)
    }
  }
  return qs
}
function getFullUrl(e: any) {
  let dateRange:[string, string]=['','']
  dateRange[0]  =  e[0]
  dateRange[1]  =  e[1]

  let url = ''
  if (props.baseUrl.indexOf('?') > 0) {
    url = props.baseUrl + '&' + getQs(dateRange)
  } else {
    url = props.baseUrl + '?' + getQs(dateRange)
  }
  emits('update:outputUrl', { url: url, dateRange:dateRange})

}
init()
</script>
