<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb">
      <template v-slot:menuLeft>
        <SearchNav v-model="refSearch"></SearchNav>
      </template>
      <template v-slot:menuRight class="p-3">
        <Btn :text="$t('tags.newText')" :action="'create'" class="m-3" @click="create"></Btn>
      </template>
      <template v-slot:default>
        <div class="bg-white shadow overflow-hidden sm:rounded-md m-3">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="tag in refTagCollection.data" :key="tag.id">
              <router-link :to="routePrefix + /texts/ + tag.id" class="block hover:bg-gray-50">
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <p
                      class="text-sm font-medium text-gray-900 truncate"
                    >{{ tag.name }}</p>
                    <div class="ml-2 flex-shrink-0 flex">
                      <div class="ml-2 flex-shrink-0 flex"></div>
                    </div>
                  </div>
                  <div class="mt-2 sm:flex sm:justify-between">
                    <div class="sm:flex">
                      <p class="flex items-center text-sm text-gray-500">
                        <TranslateIcon
                          class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        {{ getDescAttrName(tag) }}
                      </p>
                    </div>
                    <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    </div>
                  </div>
                </div>
              </router-link>
            </li>
          </ul>
        </div>
        <Pagination :pagination="refTagCollection.pagination"></Pagination>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { inject, ref, watch } from 'vue';
import Pagination from '../../../components/Pagination.vue'
import BaseLayoutVue from '../../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from './../../../store/Store'
import TagModel from './../../../Models/TagModel';
import { BaseController, ModelCollection } from './../../../Classes/BaseController'
import { TranslateIcon } from '@heroicons/vue/outline'
import { RouteService } from '../../../Classes/RouteService'
import Btn from '../../../components/Btn.vue'
import SearchNav from '../../../components/SearchNav.vue';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const breadCrumb = ref([{ name: 'Projects', href: '/projects' }])
const { t } = useI18n()

const refSearch = ref('')
const refTag = ref(new TagModel())
const refTagCollection = ref(new ModelCollection<TagModel>())

const crudController = new BaseController<TagModel>(
  '/tags',
  [],
  refTag.value,
  store.authUser.token['token'],
)

crudController.setRoutePrefix(routePrefix)

init()

async function init() {
  await RouteService.getProjectInfos(route)

  const page = route.query['page'] ? Number(route.query['page']) : 1
  refTagCollection.value = await crudController.index(page, 10, refSearch.value,{'typeFilter':'2'})
  breadCrumb.value = [{ name: 'Projects', href: '/projects' }, { name: store.currentProject.name, href: routePrefix }, { name: t('navigation.texts'), href: routePrefix + '/texts' }]

}
function getDescAttrName(model: TagModel): string {
  if (store.authUser.lang == store.currentProject.l2) {
    return model['descriptionL2']
  } else if (store.authUser.lang == store.currentProject.l3) {
    return model['descriptionL3']
  } else {
    return model['descriptionL1']
  }
}
async function create() {
  router.push(routePrefix + '/texts/create')
}
watch(() => route.query['page'], () => {
  init()
});
watch(() => refSearch.value, () => {
  init()
});
</script>
