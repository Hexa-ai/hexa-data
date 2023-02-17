<template>
    <div class="flex-grow bg-red-600">
    <div class="mx-auto w-full py-3 px-2">
      <div class="flex flex-wrap items-center justify-between">
        <div class="flex w-0 flex-1 items-center">
          <span class="flex rounded-lg bg-red-800 p-2">
            <BanIcon class="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <p class="ml-3 truncate font-medium text-white">
            <span class="md:inline">{{ msg }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
    import { BanIcon } from '@heroicons/vue/solid'

    const props = defineProps<{
        msg: string
    }>()
</script>
