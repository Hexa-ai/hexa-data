<template>
  <router-link :to="routePrefix + routeSuffix + dashboard.id" class="block bg-white hover:bg-gray-50">
    <div class="px-4 py-1 sm:px-6">
      <div class="flex items-center justify-between">
        <p class="mt-2 text-sm font-medium text-gray-900 truncate">{{ dashboard.name }}</p>
        <div class="ml-2 flex-shrink-0 flex">
          <StarIcon class="mt-2 flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true"
            :class="dashboard.stared == 1 ? 'fill-yellow-300' : ' '" />
        </div>
      </div>
      <div class="mt-1 sm:flex sm:justify-between">
        <div class="sm:flex">
          <p class="flex items-center text-sm text-gray-500">
            <TemplateIcon class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            {{ getDescAttrName(dashboard) }}
          </p>
        </div>
        <div class="mt-1 flex items-center text-sm text-gray-500 sm:mt-0">
          <router-link v-if="store.authUser.projectRole == RoleType.EDITOR ||
            store.authUser.isAdmin == 1 ||
            store.currentProject.owner.id == store.authUser.id
            " :to="routePrefix + '/dashboards/edit/' + dashboard.id"
            class="m-3 border-gray-300 text-gray-500 flex justify-center py-2 px-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2">
            {{ $t('edit') }}
          </router-link>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import Store from '../store/Store'
import { TemplateIcon, StarIcon } from '@heroicons/vue/outline'
import { useRoute } from 'vue-router'
import DashboardModel from '../Models/DashboardModel'
import RoleType from '../Contracts/RoleType'

const props = defineProps<{
  dashboard: DashboardModel
  routeSuffix: string
}>()

const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id

function getDescAttrName(model: DashboardModel): string {
  if (store.authUser.lang == store.currentProject.l2) {
    return model['descriptionL2']
  } else if (store.authUser.lang == store.currentProject.l3) {
    return model['descriptionL3']
  } else {
    return model['descriptionL1']
  }
}

const name = computed(() => {
  const splitted = props.dashboard.name.split('.')
  return splitted[splitted.length - 1]
})
</script>
