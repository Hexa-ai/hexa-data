<template>
  <IndexGrafana v-if="project?.grafanaEnabled" :project="project"></IndexGrafana>
  <IndexLegacy v-else></IndexLegacy>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import Store from '../../store/Store'
import IndexLegacy from './Index/Legacy.vue'
import IndexGrafana from './Index/Grafana.vue'

const store: Store = inject('store')!
const project = ref(store.currentProject)
</script>
