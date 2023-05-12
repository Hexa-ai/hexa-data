<template>
  <div class="">
  <WarpChart v-if="chartType=='area'" tile-id="varWarpChart" :url="url" :type="chartType" :date-picker="true" :warpScript="warpScript" :autoRefresh="autoRefresh"></WarpChart>
  <TabularTile v-if="chartType=='tabular'" :url="url" :date-picker="true" :script="warpScript"></TabularTile>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import store from '../store';
import WarpChart from './WarpChart.vue'
import TabularTile from './TabularTile.vue';

const chartType = ref('')

const props = defineProps<{
  className:string,
  url:string,
  valueType:number,
  autoRefresh?:number,
  isAlarm?:boolean,
  minTreshold?:number,
  maxTreshold?:number
}>()

let warpScript = ref('')

if (props.valueType==2 || props.valueType==3 || props.valueType==1){
  chartType.value='area'
  warpScript.value = `
  10000000 LIMIT
  {
    'token' $readToken
    'class' '${props.className}'
    'labels' {}
    'end' $end TOTIMESTAMP
    'start' $start TOTIMESTAMP
  } FETCH SORT 'data' STORE
  <% $data SIZE 0 == %>
  <% [ $readToken '${props.className}' {} ] FIND %>
  <% $data %> IFTE 'data' STORE

  <% $data 0 GET ATTRIBUTES $language GET 'description' STORE $data 0 GET ATTRIBUTES 'unit' GET 'unit' STORE $data 0 GET { NULL NULL 'i' $description 'u' $unit } SETATTRIBUTES { NULL NULL } RELABEL 'data' STORE %> <% $data 0 GET 'data' STORE %>
  <% %> TRY
  $data 10000 LTTB 'data' STORE
  $data VALUES SIZE 1 - 'lastValueIndex' STORE
  $data VALUES $lastValueIndex GET 'lastValue' STORE
  { 'data' $data
    'params' [ { 'datasetColor' '${store.publicAppSettings.appPrimaryColor}' 'xAxis' 0 } ]
    'globalParams' {
      'thresholds' [
        { 'value' ${props.minTreshold} 'color' 'red' 'fill' false }
        { 'value' ${props.maxTreshold} 'color' 'red' 'fill' false }
      }
    }
  }`
} else if (props.valueType==4) {
  chartType.value='tabular'
  warpScript.value = "{ 'token' $readToken 'class' '" + props.className + "' 'labels' {} 'end' $end TOTIMESTAMP 'start' $start TOTIMESTAMP } FETCH SORT 'gts' STORE [ $gts [] <% 'values' STORE $values 0 GET 'ts' STORE $values 7 GET 'value' STORE [ $ts $value 0 GET ] [ $ts NaN NaN NaN $value 0 GET ] %> MACROREDUCER ] REDUCE 'gtsResult' STORE"
}


</script>
