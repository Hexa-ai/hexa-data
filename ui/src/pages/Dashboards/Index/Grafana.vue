<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="refBreadCrumb" :show-tool-bar="false">
      <template v-slot:default>
        <iframe v-if="showIframe" class="w-full" style="height: calc(100%)" :src="props.project.grafanaUrl"></iframe>
        <div v-else>
          <Loader></Loader>
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
import { ref, toRefs } from 'vue'
import BaseLayoutVue from '../../../layouts/BaseLayout.vue'
import Loader from '@/components/Loader.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps(['project'])
const { project }: any = toRefs(props)

const domain = ref(new URL(project.value.grafanaUrl).host)
const showIframe = ref(false)

axios.get('/projects/' + project.value.id + '/services/grafana/cookies')
  .then((response) => {
    console.log('Writing grafana_session,grafana_session_expiry auth cookie into domain', domain.value)
    Cookies.set('grafana_session', response.data.grafana_session, { domain: domain.value })
    Cookies.set('grafana_session_expiry', response.data.grafana_session_expiry, { domain: domain.value })
    showIframe.value = true
  })
  .catch((error) => {
    showIframe.value = true
    console.error(error)
  })

const refBreadCrumb = ref([
  { name: 'Projects', href: '/projects' },
  { name: project.value.name, href: '/projects/' + project.value.id },
  { name: t('navigation.dashboards'), href: '/projects/' + project.value.id + '/dashboards' },
])
</script>
