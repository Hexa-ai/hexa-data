<script lang="ts" setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { InformationCircleIcon } from '@heroicons/vue/outline'

defineProps<{
  text: string
}>()
</script>
<template>
  <Popover>
    <PopoverButton class="focus:outline-none">
      <InformationCircleIcon class="h-4 w-4 text-amber-500" />
    </PopoverButton>
    <PopoverPanel
      class="absolute left-[7.1rem] top-[9.7rem] flex justify-center whitespace-nowrap z-10"
    >
      <span
        class="bg-gray-900 text-white rounded-md text-[0.625rem] leading-4 tracking-wide font-semibold py-1 px-3"
      >
        <svg
          aria-hidden="true"
          width="16"
          height="6"
          viewBox="0 0 16 6"
          class="text-gray-900 absolute top-full left-1/2 -mt-px -ml-2"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15 0H1V1.00366V1.00366V1.00371H1.01672C2.72058 1.0147 4.24225 2.74704 5.42685 4.72928C6.42941 6.40691 9.57154 6.4069 10.5741 4.72926C11.7587 2.74703 13.2803 1.0147 14.9841 1.00371H15V0Z"
            fill="currentColor"
          ></path>
        </svg>
        <span>{{ text }}</span>
      </span>
    </PopoverPanel>
  </Popover>
</template>
