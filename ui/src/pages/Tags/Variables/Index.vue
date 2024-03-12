<template>
  <IndexWarp10 :project="project"></IndexWarp10>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import Store from '../../../store/Store'
import IndexWarp10 from './Index/Warp10.vue'

const store: Store = inject('store')!
const project = ref(store.currentProject)
</script>
