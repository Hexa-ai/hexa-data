<template>
    <SwitchGroup as="div" class="flex items-center">
      <Switch
        v-model="refSwitchState"
        :class="[refSwitchState ? 'bg-indigo-600' : 'bg-gray-200', 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500']"
      >
        <span
          aria-hidden="true"
          :class="[refSwitchState ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200']"
        >
          <slot></slot>
        </span>
      </Switch>
      <SwitchLabel as="span" class="ml-3">
        <span class="text-sm font-medium text-gray-900">{{ text1 }}</span>
        <span class="text-sm text-gray-500">{{ text2 }}</span>
      </SwitchLabel>
    </SwitchGroup>
</template>

<script setup lang="ts">
import { watch, ref, initCustomFormatter } from 'vue'
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'

const emits = defineEmits(['update:modelValue'])



const props = defineProps<{
  text1: string,
  text2: string,
  modelValue: any
}>()

const refSwitchState = ref(props.modelValue)

watch(() => refSwitchState.value, () => {
  emits('update:modelValue', refSwitchState.value)
});

</script>