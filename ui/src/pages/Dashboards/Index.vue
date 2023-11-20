<template>
  <IndexVersion1 v-if="project?.dashboardVersion === 1"></IndexVersion1>
  <IndexVersion2 v-else-if="project?.dashboardVersion === 2" :project="project"></IndexVersion2>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import Store from '../../store/Store'
import IndexVersion1 from './Index/V1.vue'
import IndexVersion2 from './Index/V2.vue'

const store: Store = inject('store')!

const project = ref(store.currentProject)
</script>
