<template>
  <BaseLayoutVue
    :pages-bread-crumb="[{ name: 'App Version', href: '/settings/version' }]"
    :show-tool-bar="false"
  >
    <div class="grid grid-rows-1 place-items-center space-y-6 mt-2">
      <div>
        <div class="col-span-6 flex justify-center">
          <img
            class="h-32 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
            src="@/assets/logo-hexa-data.svg"
          />
        </div>
        <p class="whitespace-pre mt-2 flex items-center text-sm text-gray-500">
          <span class="text-lg font-medium">Hexa-Data </span> by Hexa-AI
        </p>
      </div>
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          {{ t('settingsPage.version') }}: {{ store.publicAppSettings.appVersion }}
        </h3>
      </div>
    </div>
  </BaseLayoutVue>
</template>

<script setup lang="ts">
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useI18n } from 'vue-i18n'
import { inject } from 'vue'
import Store from '../../store/Store'

const store: Store = inject('store')!

const { t } = useI18n()
</script>
