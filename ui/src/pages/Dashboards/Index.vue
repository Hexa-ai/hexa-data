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
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="dashboard in refdashboardCollection.data" :key="dashboard.id">
              <router-link
                :to="routePrefix + /dashboards/ + dashboard.id"
                class="block hover:bg-gray-50"
              >
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ dashboard.name }}</p>
                    <div class="ml-2 flex-shrink-0 flex">
                      <StarIcon
                        class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                        :class="dashboard.stared == 1 ? 'fill-yellow-300' : ' '"
                      />
                    </div>
                  </div>
                  <div class="mt-2 sm:flex sm:justify-between">
                    <div class="sm:flex">
                      <p class="flex items-center text-sm text-gray-500">
                        <TemplateIcon
                          class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        {{ getDescAttrName(dashboard) }}
                      </p>
                    </div>
                    <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <router-link
                        v-if="store.authUser.projectRole==RoleType.EDITOR || store.authUser.isAdmin==1 || store.currentProject.owner.id==store.authUser.id"
                        :to="routePrefix + '/dashboards/edit/' + dashboard.id"
                        class="m-3 border-gray-300 text-gray-500 flex justify-center py-2 px-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
                      >
                      {{$t('edit')}}
                      </router-link>
                    </div>
                  </div>
                </div>
              </router-link>
            </li>
          </ul>
        </div>
        <Pagination :pagination="refdashboardCollection.pagination"></Pagination>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { inject, ref, watch } from 'vue';
import Btn from '../../components/Btn.vue';
import InputField from '../../components/InputField.vue'
import InputFieldColorPicker from '../../components/InputFieldColorPicker.vue';
import FieldType from '../../Contracts/FieldType'
import Pagination from '../../components/Pagination.vue';
import BaseLayoutVue from '../../layouts/BaseLayout.vue';
import { useRouter, useRoute } from 'vue-router'
import Store from '../../store/Store'
import ProjectInfoModel from '../../Models/ProjectInfoModel';
import { BaseController, ModelCollection } from '../../Classes/BaseController'
import { DocumentIcon } from '@heroicons/vue/outline'
import DashboardModel from '../../Models/DashboardModel';
import { StarIcon, TemplateIcon } from '@heroicons/vue/outline'
import { RouteService } from '../../Classes/RouteService';
import SearchNav from '../../components/SearchNav.vue';
import RoleType from '../../Contracts/RoleType';

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

async function init() {
  refProjectInfo.value = await RouteService.getProjectInfos(route)

  refBreadCrumb.value = [{ name: 'Projects', href: '/projects' }, { name: refProjectInfo.value.name, href: routePrefix }, { name: t('navigation.dashboards'), href: routePrefix + '/dashboards' }]
  const page = route.query['page'] ? Number(route.query['page']) : 1
  refdashboardCollection.value = await dashboardCrudController.index(page, 10, refSearch.value)
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
