<template>
<div class="col-span-6 sm:col-span-4">
    <div class="col-span-6 sm:col-span-4">
      <div class="flex justify-between">
        <label class="block text-sm font-medium text-gray-700">{{ title }}</label>
      </div>
    <Popover v-slot="{ open }" class="relative">
      <PopoverButton
        :style="'background-color: '+ modelValue +';'"
        class="w-8 h-8 inline-flex items-center px-3 py-2 rounded-md group focus:outline-none ring-1 outline-dashed outline-1 outline-gray-600 focus-visible:ring-opacity-75"
      ></PopoverButton>
      <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <PopoverPanel
          class="absolute z-10 max-w-sm px-4 mt-3 transform translate-x-0 sm:px-0 lg:max-w-3xl bg-white"
        >
      <ColorPicker
      style="width: 220px;"
      theme="light"
      :color="modelValue"
      :sucker-hide="true"
      :sucker-canvas="null"
      :sucker-area="[]"
      @changeColor="changeColor"
      />
      </PopoverPanel>
      </transition>
    </Popover>
    </div>
</div>
</template>

<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { ColorPicker } from 'vue-color-kit'
import 'vue-color-kit/dist/vue-color-kit.css'
import { ref } from 'vue'
const emits = defineEmits(['update:modelValue'])

const props = defineProps<{
  title: string,
  modelValue: any,
  isDisabled?: boolean,
}>()

function changeColor(color:any){
  emits('update:modelValue', color.hex)
}
</script>
