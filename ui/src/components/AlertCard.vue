<template>
  <div class="rounded-md bg-yellow-50 p-4 mt-5">
    <div class="flex">
      <div class="flex-shrink-0">
        <ExclamationIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-yellow-800">
          {{ title }}
        </h3>
        <div class="mt-2 text-sm text-yellow-700">
          <p>
            {{ msg }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationIcon } from '@heroicons/vue/solid'

 const props = defineProps<{
   title:string,
   msg:string
 }>()
</script>
