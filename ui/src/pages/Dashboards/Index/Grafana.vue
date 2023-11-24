<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="refBreadCrumb" :show-tool-bar="false">
      <template v-slot:default>
        <iframe
          v-if="hasCookies"
          class="w-full mt-[-40px]"
          style="height: calc(100% + 40px)"
          :src="props.project.dashboardGrafanaUrl"
        ></iframe>
        <div v-else>
          <!-- TODO: add loader instead of text -->
          Chargement du tableau de bord ...
        </div>
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
import axios from '@/services/axios'
import Cookies from 'js-cookie'
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

const hasCookies = ref(false)
const grafanaCookieDomain = import.meta.env.VITE_GRAFANA_COOKIE_DOMAIN

axios.get('/projects/' + props.project.id + '/grafana/cookies').then((response) => {
  if (grafanaCookieDomain && grafanaCookieDomain !== '') {
    Cookies.set('grafana_session', response.data.grafana_session, {
      domain: grafanaCookieDomain.startsWith('.') ? grafanaCookieDomain : '.' + grafanaCookieDomain,
    })
    Cookies.set('grafana_session_expiry', response.data.grafana_session_expiry, {
      domain: grafanaCookieDomain.startsWith('.') ? grafanaCookieDomain : '.' + grafanaCookieDomain,
    })
  } else {
    Cookies.set('grafana_session', response.data.grafana_session)
    Cookies.set('grafana_session_expiry', response.data.grafana_session_expiry)
  }
  hasCookies.value = true
})

const refBreadCrumb = ref([
  { name: 'Projects', href: '/projects' },
  { name: props.project.name, href: '/projects/' + props.project.id },
  { name: t('navigation.dashboards'), href: '/projects/' + props.project.id + '/dashboards' },
])
</script>
