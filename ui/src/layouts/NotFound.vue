<template>
<div class="min-h-full pt-16 pb-12 flex flex-col bg-white">
  <main class="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex-shrink-0 flex justify-center">
      <a href="/" class="inline-flex">
        <span class="sr-only">Workflow</span>
        <img
            v-if="store.publicAppSettings.appIcon"
            class="h-28 w-auto"
            :src="store.publicAppSettings.appIcon.url"
            alt="AppLogo"
          />
          <img
            v-if="!store.publicAppSettings.appIcon"
            class="h-28 w-auto"
            src="./../assets/logo-hexa-data.svg"
            alt="AppLogo"
          />
      </a>
    </div>
    <div class="py-16">
      <div class="text-center">
        <p class="text-sm font-semibold uppercase tracking-wide" :style="'color:' + store.publicAppSettings.appPrimaryColor">{{$t('notFoundError')}}</p>
        <h1 class="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">{{$t('notFoundTitle')}}</h1>
        <p class="mt-2 text-base text-gray-500">{{$t('notFoundMsg')}}</p>
        <div class="mt-6">
          <a href="/" class="text-base font-medium hover:text-indigo-500" :style="'color:' + store.publicAppSettings.appPrimaryColor" >{{$t('backToHome')}}<span aria-hidden="true"> &rarr;</span></a>
        </div>
      </div>
    </div>
  </main>
  <footer class="flex-shrink-0 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
    <nav class="flex justify-center space-x-4">
    </nav>
  </footer>
</div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useI18n  } from 'vue-i18n'
import Store from '../store/Store';
const {t} = useI18n()

const store: Store = inject('store')!



</script>
