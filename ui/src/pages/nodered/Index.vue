<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="refBreadCrumb" :show-tool-bar="false">
      <template v-slot:default>
        <iframe :src="refNodeRedUrl" class="h-screen w-full"> </iframe>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { inject, ref, watch } from 'vue'
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from '../../store/Store'
import { RouteService } from '../../Classes/RouteService'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const refBreadCrumb = ref([
  { name: t('navigation.projects'), href: '/projects' },
  { name: 'Node-Red', href: routePrefix + '/nodered' },
])

const refNodeRedUrl = ref('')

init()

async function init() {
  await RouteService.getProjectInfos(route)
  refNodeRedUrl.value = location.protocol + '//' + location.hostname + ':1880'
}
</script>
