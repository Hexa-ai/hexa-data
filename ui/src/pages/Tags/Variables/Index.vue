<template>
  <IndexLegacy v-if="project?.variableType === 'LEGACY'"></IndexLegacy>
  <IndexWarp10 v-else-if="project?.variableType === 'WARP10'" :project="project"></IndexWarp10>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import Store from '../../../store/Store'
import IndexLegacy from './Index/Legacy.vue'
import IndexWarp10 from './Index/Warp10.vue'

const store: Store = inject('store')!
const project = ref(store.currentProject)
</script>
