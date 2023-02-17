<template>
  <form class="flex-grow flex m-3" action="#" method="GET">
    <label for="search-field" class="sr-only">Search</label>
    <div class="relative w-full text-gray-400 focus-within:text-gray-600">
      <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none">
        <SearchIcon class="h-5 w-5" aria-hidden="true" />
      </div>
      <input
        v-model="props.modelValue"
        id="search-field"
        class="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
        :placeholder="$t('search')"
        type="search"
        name="search"
        @update:modelValue="update"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { useI18n  } from 'vue-i18n'
import { SearchIcon } from '@heroicons/vue/outline'

const {t} = useI18n()

const emits = defineEmits(['update:modelValue'])

const props = defineProps<{
  modelValue: string
}>()

function update(e:Event){
  emits('update:modelValue', e)
}
</script>
