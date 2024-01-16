<template>
  <button :type="type ?? 'submit'" :class="[primary==true ? 'primary text-white' : 'border-gray-300 text-gray-500 ', 'flex justify-center space-x-2 py-2 px-3 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 has-tooltip']">
    <slot></slot>
    <StopIcon v-if="action=='stop'" class="flex-shrink-0 h-5 w-5 text-gray-400"></StopIcon>
    <PlayIcon v-if="action=='play'" class="flex-shrink-0 h-5 w-5 text-gray-400"></PlayIcon>
    <UserAddIcon v-if="action=='addUser'" class="flex-shrink-0 h-5 w-5 text-gray-400"></UserAddIcon>
    <DocumentAddIcon v-if="action=='create'" class="flex-shrink-0 h-5 w-5 text-gray-400"></DocumentAddIcon>
    <DocumentSearchIcon v-if="action=='search'" class="flex-shrink-0 h-5 w-5 text-gray-400"></DocumentSearchIcon>
    <PencilAltIcon v-if="action=='update'" class="flex-shrink-0 h-5 w-5 text-gray-400"></PencilAltIcon>
    <TrashIcon v-if="action=='delete'" class="flex-shrink-0 h-5 w-5 text-gray-400"></TrashIcon>
    <UploadIcon v-if="action=='upload'" class="flex-shrink-0 h-5 w-5 text-gray-400"></UploadIcon>
    <XIcon v-if="action=='cancel'" class="flex-shrink-0 h-5 w-5 text-gray-400"></XIcon>
    <DownloadIcon v-if="action=='download'" class="flex-shrink-0 h-5 w-5 text-gray-400"></DownloadIcon>
    <svg v-if="action=='generate'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" class="flex-shrink-0 h-5 w-5 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
    </svg>
    <span v-if="action==null || action === 'generate'">{{ text }}</span>
    <span v-else class='tooltip bg-black p-2 mt-9 rounded-md text-white'>{{ text }}</span>
  </button>
</template>
<script setup lang="ts">
  import { UserAddIcon, DocumentAddIcon, DocumentSearchIcon, PencilAltIcon, TrashIcon, UploadIcon, DownloadIcon, XIcon, PlayIcon, StopIcon } from '@heroicons/vue/outline'

  const props = defineProps<{
    text:string,
    primary:boolean
    action?:any
    type?:'button'|'submit'|'reset'
  }>()

</script>
