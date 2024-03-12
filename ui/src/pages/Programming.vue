<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="refBreadCrumb" :show-tool-bar="false">
      <template v-slot:default>
        <iframe v-if="project?.nodeRedUrl" class="w-full" style="height: calc(100%)" :src="project?.nodeRedUrl"></iframe>
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
import { ref, toRefs, inject } from 'vue'
import BaseLayoutVue from '../layouts/BaseLayout.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const store:any = inject('store')!

const project = store.currentProject

const refBreadCrumb = ref([
  { name: 'Projects', href: '/projects' },
  { name: project.value?.name, href: '/projects/' + project.value?.id },
  { name: t('navigation.programming'), href: '/projects/' + project.value?.id + '/programming' },
])
</script>
