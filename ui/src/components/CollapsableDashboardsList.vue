<template>
  <div class="divide-y divide-gray-200">
    <div
      class="flex justify-between cursor-pointer py-4 hover:bg-gray-50 pl-2 sm:pl-4"
      @click="shown = !shown"
    >
      <div class="flex space-x-2 items-center">
        <FolderIcon class="h-4 w-4 text-gray-400" />
        <span class="font-semibold">{{ data.namespace }}</span>
      </div>

      <div class="pr-4">
        <ChevronUpIcon v-if="shown" class="h-5 w-5 text-gray-400" aria-hidden="true" />
        <ChevronDownIcon v-else class="h-5 w-5 text-gray-400 cursor-pointer" aria-hidden="true" />
      </div>
    </div>

    <div
      v-for="item in props.data.children"
      :key="isDashboard(item) ? item.id : item.namespace"
      v-show="shown"
      class="pl-4"
    >
      <CollapsableDashboardsListItem
        v-if="isDashboard(item)"
        :route-suffix="routeSuffix"
        :dashboard="item"
        :level="props.level"
      />
      <CollapsableDashboardsList
        v-else
        :route-suffix="routeSuffix"
        :data="item"
        :level="props.level + 1"
        :parentNamespace="namespace"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon, ChevronUpIcon, FolderIcon } from '@heroicons/vue/outline'
import { computed, ref } from 'vue'
import HierarchizedData from '../Contracts/HierarchizedData'
import DashboardModel from '../Models/DashboardModel'
import CollapsableDashboardsListItem from './CollapsableDashboardsListItem.vue'

const props = defineProps<{
  data: HierarchizedData<DashboardModel>
  level: number
  parentNamespace?: string
  routeSuffix: string
}>()

const isDashboard = (item: DashboardModel | HierarchizedData<DashboardModel>): item is DashboardModel => {
  return item.hasOwnProperty('id')
}

const shown = ref(false)

const namespace = computed(() => {
  return props.parentNamespace
    ? props.parentNamespace + '.' + props.data.namespace
    : props.data.namespace
})
</script>
