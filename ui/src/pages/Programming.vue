<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="refBreadCrumb" :show-tool-bar="false">
      <template v-slot:default>
        <iframe v-if="iframeUrl" class="w-full" style="height: calc(100%)" :src="iframeUrl"></iframe>
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
import { ref } from 'vue'
import BaseLayoutVue from '../layouts/BaseLayout.vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
const { t } = useI18n()
const route = useRoute()

function slugify(str : string) {
  return String(str)
    .normalize('NFKD') 
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const iframeUrl = ref(null)
const project:any = ref({})

init()
async function init() {
  project.value = (await axios.get('/projects/' + route.params.id)).data
  const keyname = 'auth-tokens-containers-node-red-' + slugify(project.value?.name)

  const response = await axios.get('/projects/' + route.params.id + '/services/node-red/token')
  console.log(`Writing ${keyname} session storage tokens for node-red`)
  localStorage.setItem(keyname, JSON.stringify(response.data));

  iframeUrl.value = project.value.nodeRedUrl
}

const refBreadCrumb = ref([
  { name: 'Projects', href: '/projects' },
  { name: project.value?.name, href: '/projects/' + project.value?.id },
  { name: t('navigation.programming'), href: '/projects/' + project.value?.id + '/programming' },
])
</script>
