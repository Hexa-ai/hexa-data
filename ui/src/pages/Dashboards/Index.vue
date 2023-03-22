<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="refBreadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft>
        <SearchNav class="h-full" v-model="refSearch"></SearchNav>
      </template>
      <template v-slot:menuRight class="p-3">
        <Btn
          v-if="store.authUser.projectRole==RoleType.EDITOR || store.authUser.isAdmin==1 || store.currentProject.owner.id==store.authUser.id"
          :text="$t('dashboards.newDashboard')"
          :action="'create'"
          :primary="false"
          class="m-3"
          @click="create"
        ></Btn>
      </template>
      <template v-slot:default>
        <div class="bg-white shadow overflow-hidden sm:rounded-md m-3">
          <CollapsableDashboardsList
            v-for="dashboard in DashboardsHierarchizer.hierarchize(refdashboardCollection.data)"
            :level="0"
            :data="dashboard"
            route-suffix="/dashboards/"
          ></CollapsableDashboardsList>
        </div>
        <Pagination :pagination="refdashboardCollection.pagination"></Pagination>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, inject, ref, watch } from 'vue';
import Btn from '../../components/Btn.vue';
import Pagination from '../../components/Pagination.vue';
import BaseLayoutVue from '../../layouts/BaseLayout.vue';
import { useRouter, useRoute } from 'vue-router'
import Store from '../../store/Store'
import { BaseController, ModelCollection } from '../../Classes/BaseController'
import DashboardModel from '../../Models/DashboardModel';
import { StarIcon, TemplateIcon } from '@heroicons/vue/outline'
import { RouteService } from '../../Classes/RouteService';
import SearchNav from '../../components/SearchNav.vue';
import RoleType from '../../Contracts/RoleType';
import DashboardsHierarchizer from '../../Classes/DashboardsHierarchizer';
import CollapsableDashboardsList from '../../components/CollapsableDashboardsList.vue';

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const refProjectInfo = ref(store.currentProject)
const { t } = useI18n()
const refBreadCrumb = ref([{ name: 'Projects', href: '/projects' }])

const refSearch = ref('')
const refdashboard = ref(new DashboardModel())
const refdashboardCollection = ref(new ModelCollection<DashboardModel>())

const dashboardCrudController = new BaseController<DashboardModel>(
  '/dashboards',
  [{ name: 'photo' }],
  refdashboard.value,
  store.authUser.token['token'],
)

dashboardCrudController.setRoutePrefix('/projects/' + String(route.params.id))

init()

const dashboardsList = computed(() => DashboardsHierarchizer.hierarchize(refdashboardCollection.value.data))

async function init() {
  refProjectInfo.value = await RouteService.getProjectInfos(route)

  refBreadCrumb.value = [{ name: 'Projects', href: '/projects' }, { name: refProjectInfo.value.name, href: routePrefix }, { name: t('navigation.dashboards'), href: routePrefix + '/dashboards' }]
  const page = route.query['page'] ? Number(route.query['page']) : 1

  const dashboards = await dashboardCrudController.index(page, 1000, refSearch.value)
  refdashboardCollection.value = dashboards
  console.log(DashboardsHierarchizer.hierarchize(dashboards.data))
}
function getDescAttrName(model: DashboardModel): string {
  if (store.authUser.lang == store.currentProject.l2) {
    return model['descriptionL2']
  } else if (store.authUser.lang == store.currentProject.l3) {
    return model['descriptionL3']
  } else {
    return model['descriptionL1']
  }
}
async function create(){
  router.push(routePrefix + '/dashboards/create')
}
watch(() => route.query['page'], () => {
  init()
});
watch(() => refSearch.value, () => {
  init()
});
</script>
