<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="refBreadCrumb">
      <template v-slot:default>
        <iframe class="w-full h-full" :src="props.project.dashboardV2GrafanaUrl"></iframe>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<style>
/* FIX FOR FULL HEIGHT DOCUMENT IFRAME */
#pageBody {
  height: 100%;
}
</style>

<script setup lang="ts">
import { ref, PropType } from 'vue'
import ProjectModel from './../../../Models/ProjectModel'
import BaseLayoutVue from '../../../layouts/BaseLayout.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  project: {
    type: Object as PropType<ProjectModel>,
    required: true,
  },
})

const routePrefix = '/projects/' + props.project.id

const refBreadCrumb = ref([
  { name: 'Projects', href: '/projects' },
  { name: props.project.name, href: routePrefix },
  { name: t('navigation.dashboards'), href: routePrefix + '/dashboards' },
])
</script>
