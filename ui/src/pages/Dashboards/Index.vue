<template>
  <IndexLegacy v-if="project?.dashboardType === 'LEGACY'"></IndexLegacy>
  <IndexGrafana v-else-if="project?.dashboardType === 'GRAFANA'" :project="project"></IndexGrafana>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import Store from '../../store/Store'
import IndexLegacy from './Index/Legacy.vue'
import IndexGrafana from './Index/Grafana.vue'

const store: Store = inject('store')!
const project = ref(store.currentProject)
</script>
