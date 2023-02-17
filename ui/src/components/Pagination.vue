<template>
  <nav
    class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
    aria-label="Pagination"
  >
    <div class="hidden sm:block">
      <p class="text-sm text-gray-700">
        {{ $t("components.pagination.showing") }}
        {{ ' ' }}
        <span class="font-medium">{{props.pagination.currentPage * props.pagination.perPage - (props.pagination.perPage - 1)}}</span>
        {{ ' ' }}
        {{ $t("components.pagination.to") }}
        {{ ' ' }}
        <span class="font-medium">{{props.pagination.currentPage * props.pagination.perPage}}</span>
        {{ ' ' }}
        {{ $t("components.pagination.of") }}
        {{ ' ' }}
        <span class="font-medium">{{props.pagination.total}}</span>
        {{ ' ' }}
        {{ $t("components.pagination.results") }}
      </p>
    </div>
    <div class="flex-1 flex justify-between sm:justify-end">
      <router-link
        v-if="props.pagination.currentPage>1"
        :to="{ path: route.path, query: { page: props.pagination.currentPage - 1 }}"
        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >{{ $t("components.pagination.previous") }}</router-link>
      <router-link
        v-if="(props.pagination.currentPage * props.pagination.perPage)<props.pagination.total"
        :to="{ path: route.path, query: { page: props.pagination.currentPage + 1 }}"
        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >{{ $t("components.pagination.next") }}</router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { BaseController, Pagination } from '../Classes/BaseController'

const route = useRoute()
const props = defineProps<{
  pagination:Pagination
}>()

</script>
