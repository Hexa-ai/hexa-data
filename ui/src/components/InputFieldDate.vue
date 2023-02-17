<template>
  <div class="">
    <div class="">
      <div class="flex justify-between">
        <label for="email" class="block text-sm font-medium text-gray-700">{{ title }}</label>
        <span v-if="isRequired" class="text-sm text-gray-500">*</span>
      </div>
      <Datepicker
          :local="local"
          :range="range"
          format="dd/MM/yyyy HH:mm:ss"
          :cancelText="cancelText"
          :selectText="selectText"
          :required="isRequired"
          inputClassName="peer block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          v-model="props.modelValue"
          @update:modelValue="emitDateTime"
          :disabled="isDisabled == true"
          class="w-full"
          enableSeconds
        ></Datepicker>
    </div>
  </div>
</template>

<script setup lang="ts">
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const emits = defineEmits(['update:modelValue'])

const props = defineProps<{
  title: string,
  range:boolean,
  modelValue: string | [string , string],
  isRequired?: boolean,
  isDisabled?: boolean,
  local?: string
  selectText?: string
  cancelText?: string
}>()



function emitDateTime(e:string | [string , string]) {
  if(props.range==true){
    const eventStart = new Date( String(e[0]));
    const eventEnd = new Date( String(e[1]));
    let newRange: [string , string] = ['','']
    newRange[0]=eventStart.toISOString()
    newRange[1]=eventEnd.toISOString()
    emits('update:modelValue', newRange)
  } else {
    const event = new Date( String(e));
    emits('update:modelValue', event.toISOString())
  }

}
</script>
