<template>
  <ShowWarp10 :project="project"></ShowWarp10>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import Store from '../../../store/Store'
import ShowWarp10 from './Show/Warp10.vue'

const store: Store = inject('store')!
const project = ref(store.currentProject)
</script>
