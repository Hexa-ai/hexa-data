<template>
  <router-link :to="routePrefix + routeSuffix + tag.id" class="block bg-white hover:bg-gray-50">
    <div class="px-2 py-4 sm:px-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <VariableIcon class="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />

          <p class="text-sm font-medium text-gray-900 truncate">
            {{ name }}
          </p>
        </div>
        <div class="ml-2 flex-shrink-0 flex">
          <div v-if="tag.type==4 && tag.macroUuid == null" class="ml-2 flex-shrink-0 flex">
            <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-800 text-gray-100">
              {{ $t('tags.stopped') }}
            </p>
          </div>
          <div v-if="tag.type==4 && tag.macroUuid != null" class="ml-2 flex-shrink-0 flex">
            <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-600 text-gray-100">
              {{ $t('tags.running') }}
            </p>
          </div>
          <div v-if="tag.valueType == 1" class="ml-2 flex-shrink-0 flex">
            <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-500 text-gray-100">
              Boolean
            </p>
          </div>
          <div v-if="tag.valueType == 2" class="ml-2 flex-shrink-0 flex">
            <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-500 text-gray-100">
              Integer
            </p>
          </div>
          <div v-if="tag.valueType == 3" class="ml-2 flex-shrink-0 flex">
            <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-500 text-gray-100">
              Float
            </p>
          </div>
          <div v-if="tag.valueType == 4" class="ml-2 flex-shrink-0 flex">
            <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-500 text-gray-100">
              String
            </p>
          </div>
          <div class="ml-2 flex-shrink-0 flex"></div>
        </div>
      </div>
      <div class="mt-2 sm:flex sm:justify-between">
        <div class="sm:flex">
          <p class="flex items-center text-sm text-gray-500">
            {{ getDescAttrName(tag) }}
          </p>
        </div>
        <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
          <p v-if="tag.unit != '' && tag.unit != null"
            class="px-2 inline-flex text-xs leading-5 font-semibold text-gray-800">
            {{ $t('tags.unit') + ': ' + tag.unit }}
          </p>
          <p v-if="tag.type == 3 || tag.type == 4" class="px-2 inline-flex text-xs leading-5 font-semibold text-gray-800">
            {{ (tag.type == 3 ? 'WarpScript' : 'Javascript') }}
          </p>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import TagModel from '../Models/TagModel'
import Store from '../store/Store'
import { VariableIcon } from '@heroicons/vue/outline'
import { useRoute } from 'vue-router'

const props = defineProps<{
  tag: TagModel
  routeSuffix: string
}>()

const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id

function getDescAttrName(model: TagModel): string {
  if (store.authUser.lang == store.currentProject.l2) {
    return model['descriptionL2']
  } else if (store.authUser.lang == store.currentProject.l3) {
    return model['descriptionL3']
  } else {
    return model['descriptionL1']
  }
}

const name = computed(() => {
  const splitted = props.tag.name.split('.')
  return splitted[splitted.length - 1]
})
</script>
