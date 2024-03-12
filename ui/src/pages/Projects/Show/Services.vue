<template>
  <h3 class="mb-4 text-2xl font-medium text-gray-900">Services liés au projet</h3>
  <Grafana :project="project" :edit="edit" @updated="emitUpdated"></Grafana>
  <NodeRed :project="project" :edit="edit" @updated="emitUpdated"></NodeRed>
</template>

<script setup lang="ts">
import { defineProps, toRefs } from 'vue'
import Grafana from './Services/Grafana.vue'
import NodeRed from './Services/NodeRed.vue'
const props = defineProps(['project', 'edit'])
const emit = defineEmits(['updated'])
const { project, edit } = toRefs(props)

const emitUpdated = () => {
  emit('updated')
}
</script>