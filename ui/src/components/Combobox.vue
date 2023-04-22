<template>
  <Combobox as="div" v-model="selectedChoice">
    <ComboboxLabel class="block text-sm font-medium text-gray-700">{{ title }}</ComboboxLabel>
    <div class="relative mt-1">
      <ComboboxInput
        class="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
        @change="handleChange"
        :display-value="(choice: any) => choice"
      />
      <ComboboxButton
        class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
      >
        <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
      </ComboboxButton>

      <ComboboxOptions
        class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <ComboboxOption v-if="query && !filteredChoices.includes(query)" :value="query">
          <li
              :class="['relative select-none py-2 pl-3 pr-9 cursor-pointer text-gray-900']"
            >
          Ajouter "{{ query }}"
        </li>
        </ComboboxOption>
        <ComboboxOption
          v-for="choice in filteredChoices"
          :key="choice"
          :value="choice"
          as="template"
          v-slot="{ active, selected }"
        >
          <li
            :class="[
              'relative select-none py-2 pl-3 pr-9 cursor-pointer',
              active ? 'bg-indigo-600 text-white' : 'text-gray-900',
            ]"
          >
            <div class="flex">
              <span :class="['truncate', selected && 'font-semibold']">
                {{ choice }}
              </span>
            </div>

            <span
              v-if="selected"
              :class="[
                'absolute inset-y-0 right-0 flex items-center pr-4',
                active ? 'text-white' : 'text-indigo-600',
              ]"
            >
              <CheckIcon class="h-5 w-5" aria-hidden="true" />
            </span>
          </li>
        </ComboboxOption>
      </ComboboxOptions>
    </div>
  </Combobox>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/vue'

const props = defineProps<{
  title: string
  choices: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': (value: string) => void
}>()

const query = ref('')
const selectedChoice = ref()
const filteredChoices = computed(() =>
  query.value === ''
    ? props.choices
    : props.choices.filter((choice) => choice.toLowerCase().includes(query.value.toLowerCase()))
)

function handleChange(e: Event) {
  query.value = (e.target as HTMLInputElement).value
  emit['update:modelValue'](selectedChoice.value)
}
</script>
