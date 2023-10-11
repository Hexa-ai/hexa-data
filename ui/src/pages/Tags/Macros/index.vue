<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft>
        <SearchNav v-model="refSearch"></SearchNav>
      </template>
      <template v-slot:menuRight class="p-3">
        <Btn
          :text="$t('tags.newMacro')"
          :action="'create'"
          :primary="false"
          class="m-3"
          @click="create"
        ></Btn>
      </template>

      <template v-slot:default>
        <div class="bg-white shadow overflow-hidden sm:rounded-md m-3">
          <CollapsableList
            v-for="item in Utils.hierarchizeData(refTagCollection.data).result"
            :key="item.namespace"
            :data="item"
            :level="1"
            :route-suffix="'/macros/'"
          />
          <CollapsableListItem
            v-for="item in Utils.hierarchizeData(refTagCollection.data).rest"
            :key="item.name"
            :tag="item"
            :level="1"
            :route-suffix="'/macros/'"
          />
        </div>
        <Pagination :pagination="refTagCollection.pagination"></Pagination>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { inject, ref, watch } from 'vue'
import Pagination from '../../../components/Pagination.vue'
import BaseLayoutVue from '../../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from './../../../store/Store'
import TagModel from './../../../Models/TagModel'
import { BaseController, ModelCollection } from './../../../Classes/BaseController'
import { RouteService } from '../../../Classes/RouteService'
import Btn from '../../../components/Btn.vue'
import SearchNav from '../../../components/SearchNav.vue'
import { Utils } from '../../../Classes/Utils'
import CollapsableList from '../../../components/CollapsableList.vue'
import CollapsableListItem from '../../../components/CollapsableListItem.vue'

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const breadCrumb = ref([{ name: 'Projects', href: '/projects' }])
const { t } = useI18n()

const refSearch = ref('')
const refTag = ref(new TagModel())
const refTagCollection = ref(new ModelCollection<TagModel>())
const refNamespace = ref<string>(
  route.query['namespace'] ? route.query['namespace'].toString() : ''
)

const crudController = new BaseController<TagModel>(
  '/tags',
  [],
  refTag.value,
  store.authUser.token['token']
)

crudController.setRoutePrefix(routePrefix)

init()

async function init() {
  await RouteService.getProjectInfos(route)

  const page = route.query.page ? Number(route.query.page) : 1
  const opt: any = { typeFilter: 'macro' }
  if (refNamespace.value) {
    opt.namespace = refNamespace.value
  }
  refTagCollection.value = await crudController.index(page, 10, refSearch.value, opt)
  console.log(Utils.hierarchizeData(refTagCollection.value.data))
  breadCrumb.value = [
    { name: 'Projects', href: '/projects' },
    { name: store.currentProject.name, href: routePrefix },
    { name: t('navigation.macros'), href: routePrefix + '/macros' },
  ]
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
  router.push(routePrefix + '/macros/create')
}
watch(
  () => route.query['page'],
  () => {
    init()
  }
)
watch(
  () => route.query['namespace'],
  () => {
    init()
  }
)
watch(
  () => refSearch.value,
  () => {
    init()
  }
)
watch(
  () => refNamespace.value,
  () => {
    init()
  }
)
</script>
