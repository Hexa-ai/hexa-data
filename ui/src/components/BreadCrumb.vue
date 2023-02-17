<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <nav aria-label="Breadcrumb">
    <ol role="list" class="bg-white rounded-md px-6 flex space-x-4">
      <li class="flex">
        <div class="flex items-center">
           <router-link to="/projects" class="text-gray-400 hover:text-gray-500">
            <HomeIcon class="flex-shrink-0 h-5 w-5" aria-hidden="true" />
            <span class="sr-only">Home</span>
          </router-link>
        </div>
      </li>
      <li v-for="page in pages" :key="page.name" class="flex">
        <div class="flex items-center">
          <svg class="flex-shrink-0 w-6 h-full text-gray-200" viewBox="0 0 24 44" preserveAspectRatio="none" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
          </svg>
          <router-link :to="page.href" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700" :aria-current="page.current ? 'page' : undefined">{{ page.name }}</router-link>
          <!-- <a :href="page.href" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700" :aria-current="page.current ? 'page' : undefined">{{ page.name }}</a> -->
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { HomeIcon } from '@heroicons/vue/solid'
import { useRoute } from 'vue-router'
const route = useRoute()

const props = defineProps<{
  pages?: {name:string,href:string,current?:boolean}[]
}>()

const refpages = ref(props.pages)
</script>
