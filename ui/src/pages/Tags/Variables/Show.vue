<template>
  <ShowLegacy v-if="project?.variableType === 'LEGACY'"></ShowLegacy>
  <ShowWarp10 v-else-if="project?.variableType === 'WARP10'" :project="project"></ShowWarp10>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import Store from '../../../store/Store'
import ShowLegacy from './Show/Legacy.vue'
import ShowWarp10 from './Show/Warp10.vue'

const store: Store = inject('store')!
const project = ref(store.currentProject)
</script>
