<template>
  <div id="layout" class="h-screen overflow-y-scroll" :style="[imgBgUrl!=null && enableImgBg==1 ?'background-image: url('+ imgBgUrl +');':'','background-color:'+ bgColor +';']">
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog as="div" class="fixed inset-0 flex z-40 md:hidden" @close="sidebarOpen = false">
        <TransitionChild as="template" enter="transition-opacity ease-linear duration-300" enter-from="opacity-0"
          enter-to="opacity-100" leave="transition-opacity ease-linear duration-300" leave-from="opacity-100"
          leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </TransitionChild>
        <TransitionChild as="template" enter="transition ease-in-out duration-300 transform"
          enter-from="-translate-x-full" enter-to="translate-x-0" leave="transition ease-in-out duration-300 transform"
          leave-from="translate-x-0" leave-to="-translate-x-full">
          <div :style="{ backgroundColor: store.publicAppSettings.appMenuBgBodyColor }"
            class="baba relative flex-1 flex flex-col max-w-xs w-full pb-4 bg-gray-800">
            <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0"
              enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
              <div class="absolute top-0 right-0 -mr-12 pt-2">
                <button type="button"
                  class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  @click="sidebarOpen = false">
                  <span class="sr-only">Close sidebar</span>
                  <XIcon class="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>
            <router-link to="/projects" :style="{ backgroundColor: store.publicAppSettings.appMenuBgHeaderColor }"
              class="h-16 flex-shrink-0 flex items-center px-4">
              <img v-if="hasCustomLogo" class="h-8 w-auto shadow-slate-200" :src="store.publicAppSettings.appIcon.url"
                alt="AppLogo" />
              <img v-if="!hasCustomLogo" class="h-8 w-auto shadow-slate-200" src="./../assets/logo-hexa-data.svg"
                alt="AppLogo" />
              <div class="h2 menu-header-font text-lg ml-3 font-medium">{{ store.publicAppSettings.appTitle }}</div>
            </router-link>
            <div class="mt-5 flex-1 h-0 overflow-y-auto">
              <nav class="px-2 space-y-1">
                <ul>
                  <template v-for="item in navigation" :key="item.name">
                    <li v-if="item.visible==true">
                      <router-link
                        :style="[item.current ? { backgroundColor: store.publicAppSettings.appMenuBgCurrentBodyColor } : { backgroundColor: store.publicAppSettings.appMenuBgBodyColor }, { color: store.publicAppSettings.appMenuFontBodyColor }]"
                        :class="['group flex items-center px-2 py-2 text-base font-medium rounded-md']" :to="item.href">
                        <component :is="item.icon"
                          :style="[item.current ? { backgroundColor: store.publicAppSettings.appMenuBgCurrentBodyColor } : { backgroundColor: store.publicAppSettings.appMenuBgBodyColor }, { color: store.publicAppSettings.appMenuFontBodyColor }]"
                          :class="[item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300', 'mr-4 flex-shrink-0 h-6 w-6']"
                          aria-hidden="true" />
                        {{ item.name }}
                      </router-link>
                      <ul>
                        <template v-for="subItem in item.subItems" :key="subItem.name">
                          <li v-if="subItem.visible==true">
                            <router-link
                              :style="[item.current ? { backgroundColor: store.publicAppSettings.appMenuBgCurrentBodyColor } : { backgroundColor: store.publicAppSettings.appMenuBgBodyColor }, { color: store.publicAppSettings.appMenuFontBodyColor }]"
                              :class="['group flex items-center px-5 py-2 text-base font-normal rounded-md']"
                              :to="subItem.href">
                              <component :is="subItem.icon"
                                :style="[item.current ? { backgroundColor: store.publicAppSettings.appMenuBgCurrentBodyColor } : { backgroundColor: store.publicAppSettings.appMenuBgBodyColor }, { color: store.publicAppSettings.appMenuFontBodyColor }]"
                                :class="[item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300', 'mr-4 flex-shrink-0 h-4 w-4']"
                                aria-hidden="true" />
                              {{ subItem.name }}
                            </router-link>
                          </li>
                        </template>
                      </ul>
                    </li>
                  </template>
                </ul>
              </nav>
            </div>
          </div>
        </TransitionChild>
        <div class="flex-shrink-0 w-14" aria-hidden="true">
          <!-- Dummy element to force sidebar to shrink to fit close icon -->
        </div>
      </Dialog>
    </TransitionRoot>
    <!-- Static sidebar for desktop -->
    <div
      :class="['hidden md:flex md:flex-col md:fixed md:inset-y-0 shadow', refShowSideBarDesktop==true ? 'md:w-64' : 'md:w-20' ]">
      <!-- Sidebar component, swap this element with another sidebar if you like -->
      <div class="menu-body flex-1 flex flex-col min-h-0">
        <div class="flex items-center h-16 flex-shrink-0 px-4 menu-header">
          <div @click="toggleMenu()">
            <img v-if="store.publicAppSettings.appIcon" class="h-12 w-auto shadow-slate-200"
              :src="store.publicAppSettings.appIcon.url" alt="AppLogo" />
            <img v-if="!store.publicAppSettings.appIcon" class="h-12 w-auto shadow-slate-200"
              src="./../assets/logo-hexa-data.svg" alt="AppLogo" />
          </div>
          <router-link to="/projects" v-if="refShowSideBarDesktop" class="h2 menu-header-font text-lg ml-3 font-medium">
            {{ store.publicAppSettings.appTitle }}
          </router-link>
        </div>
        <div class="flex-1 flex flex-col overflow-y-auto">
          <nav class="flex-1 px-2 py-4 space-y-1">
            <ul>
              <template v-for="item in navigation" :key="item.name">
                <li v-if="item.visible==true">
                  <router-link :to="item.href"
                    :class="[item.current ? 'menu-body-current-element menu-body-font' : 'menu-body-font menu-body-element', 'group flex items-center px-2 py-2 text-sm font-medium rounded-md', refShowSideBarDesktop ? 'mt-2' : 'justify-center mt-4']">
                    <component :is="item.icon"
                      :class="[item.current ? 'menu-body-font' : 'menu-body-font ', 'flex-shrink-0 h-6 w-6']"
                      aria-hidden="true" />
                    <div v-if="refShowSideBarDesktop" class="ml-3">{{ item.name }}</div>
                  </router-link>
                  <ul>
                    <template v-if="refShowSideBarDesktop" v-for="subItem in item.subItems" :key="subItem.name">
                      <li v-if="subItem.visible==true">
                        <router-link :to="subItem.href"
                          :class="[subItem.current ? 'menu-body-current-element menu-body-font' : 'menu-body-font menu-body-element', 'group flex items-center px-5 py-2 text-sm font-normal rounded-md']">
                          <component :is="subItem.icon"
                            :class="[subItem.current ? 'menu-body-font' : 'menu-body-font ', 'mr-3 flex-shrink-0 h-4 w-4']"
                            aria-hidden="true" />
                          {{ subItem.name }}
                          <span v-if="subItem.tooltip" class="hidden hover:block absolute right-0 mr-4">
                            <ExclamationCircleIcon class="h-4 w-4 text-gray-400" aria-hidden="true" />
                          </span>
                          <div v-if="subItem.tooltip" class="ml-1">
                            <Tooltip :text="subItem.tooltip" />
                          </div>
                        </router-link>
                      </li>
                    </template>
                  </ul>
                </li>
              </template>
            </ul>
          </nav>
        </div>
      </div>
    </div>
    <div id="pageBody" :class="['flex flex-col', refShowSideBarDesktop ? 'md:pl-64' : 'md:pl-20','' ]">
      <div id="appNavTop" style="margin-left:0px" class="sticky top-0 flex-shrink-0 flex h-16 bg-white shadow">
        <button type="button"
          class="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
          @click="sidebarOpen = true">
          <span class="sr-only">Open sidebar</span>
          <MenuAlt2Icon class="h-6 w-6" aria-hidden="true" />
        </button>
        <div class="flex-1 flex justify-between">
          <div class="flex-1 flex">
            <BreadCrumbVue
              style="margin-left:1px"
              class="hidden sticky top-16 z-100 md:flex-shrink-0 h-16 md:flex bg-white shadow-sm"
              :pages="pagesBreadCrumb"
            ></BreadCrumbVue>
            <slot name="menuTopRight"></slot>
          </div>
          <div class="ml-4 flex items-center md:ml-6">
            <!-- Profile dropdown -->
            <Menu as="div" class="ml-3 relative">
              <div>
                <MenuButton
                  class="max-w-xs mr-3 bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span class="sr-only">Open user menu</span>
                  <img v-if="hasProfilePicture" class="h-10 w-10 rounded-full" :src="store.authUser.photo.url" />
                  <span v-if="!hasProfilePicture" class="inline-block h-10 rounded-full overflow-hidden bg-gray-100">
                    <svg class="h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                </MenuButton>
              </div>
              <transition enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95">
                <MenuItems
                  class=" origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem v-slot="{ active }">
                  <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                    v-on:click="profile">Profile</a>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                  <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                    v-on:click="logout">Logout</a>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </div>
      <nav id="appNavTool" v-if="showToolBar"
        class="sticky top-16 flex-shrink-0 h-16 flex bg-white shadow-sm">
        <slot name="menuLeft" class="flex-none"></slot>
        <div class="flex-grow"></div>
        <slot name="menuRight" class="flex-none"></slot>
      </nav>

      <main ref="refAppBody" id="appBody" class="flex-1">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, inject, computed, FunctionalComponent, HTMLAttributes, VNodeProps } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BreadCrumbVue from '../components/BreadCrumb.vue'
import Store from '../store/Store'
import { Dialog, DialogOverlay, Menu, MenuButton, MenuItem, MenuItems, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { InformationCircleIcon, TemplateIcon, DocumentReportIcon, ExclamationCircleIcon, PuzzleIcon, FolderIcon, ChipIcon, VariableIcon, CollectionIcon, BookmarkIcon, BookmarkAltIcon, TranslateIcon, CodeIcon, HomeIcon, MenuAlt2Icon, UsersIcon, XIcon, CogIcon, CubeIcon } from '@heroicons/vue/outline'
import DashboardModel from '../Models/DashboardModel'
import { BaseController, ModelCollection } from '../Classes/BaseController'
import RoleType from '../Contracts/RoleType'
import { RouteService } from '../Classes/RouteService'
import Tooltip from '../components/Tooltip.vue'
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const props = defineProps<{
  pagesBreadCrumb: { name: string, href: string, current?: boolean }[],
  showToolBar: boolean,
  bgColor?:string,
  enableImgBg?:any,
  imgBgUrl?:string,
}>()
const routePrefix = '/projects/' + route.params.id
let refShowSideBarDesktop = ref(store.showSideBarDesktop)
for (var page in props.pagesBreadCrumb) {
  props.pagesBreadCrumb[page].current = (props.pagesBreadCrumb[page].href == route.path)
}

let navigation = ref()

let mainNav = [
  { name: t('navigation.projects'), visible: true, href: '/projects', icon: HomeIcon, current: route.path == '/projects', subItems: [] },
  { name: t('navigation.users'), visible: store.authUser.isAdmin == 1, href: '/users', icon: UsersIcon, current: route.path == '/users', subItems: [] },
  { name: t('navigation.settings'), visible: store.authUser.isAdmin == 1, href: '/settings', icon: CogIcon, current: route.path == '/settings', subItems: [{ name: "Version", visible: true, href: '/settings/version', icon: CubeIcon, current: route.path == '/settings/version' }] }
]

let nodeRedActivated:boolean=false;
import.meta.env.VITE_NR_ACTIVATED.toLowerCase()=='true'?nodeRedActivated=true:nodeRedActivated=false;

type NavItem = {
  name: string,
  tooltip?: string,
  visible: boolean,
  href: string,
  icon?: FunctionalComponent<HTMLAttributes & VNodeProps, {}>
  current: boolean,
  subItems?: NavItem[]
}

let projectNav: NavItem[] = [
  { name: t('navigation.informations'), visible: true, href: routePrefix, icon: InformationCircleIcon, current: route.path == routePrefix, subItems: [] },
  { name: t('navigation.dashboards'), visible: true, href: routePrefix + '/dashboards', icon: CollectionIcon, current: route.path == routePrefix + '/dashboards', subItems: [] },
  { name: t('navigation.reports'), visible: true, href: routePrefix + '/reports', icon: DocumentReportIcon, current: route.path == routePrefix + '/reports', subItems: [] },
  { name: t('navigation.documents'), visible: true, href: routePrefix + '/documents', icon: FolderIcon, current: route.path == routePrefix + '/documents', subItems: [] },
  { name: t('navigation.devices'), visible: true, href: routePrefix + '/devices', icon: ChipIcon, current: route.path == routePrefix + '/devices', subItems: [] },
  { name: t('navigation.variables'), visible: true, href: routePrefix + '/variables', icon: VariableIcon, current: route.path == routePrefix + '/variables' },
  { name: t('navigation.macros'), visible: (store.authUser.projectRole == RoleType.EDITOR || store.authUser.isAdmin == 1 || store.currentProject.owner.id == store.authUser.id), href: routePrefix + '/macros', icon: CodeIcon, current: route.path == routePrefix + '/macros' },
  { name: 'Node-Red', visible: ((store.authUser.projectRole == RoleType.EDITOR || store.authUser.isAdmin == 1 || store.currentProject.owner.id == store.authUser.id) && nodeRedActivated), href: routePrefix + '/nodered', icon: PuzzleIcon, current: route.path == routePrefix + '/nodered', subItems: [] },
  { name: t('navigation.users'), visible: (store.authUser.projectRole == RoleType.EDITOR || store.authUser.isAdmin == 1 || store.currentProject.owner.id == store.authUser.id), href: routePrefix + '/users', icon: UsersIcon, current: route.path == routePrefix + '/users', subItems: [] },
  { name: t('navigation.settings'), visible: (store.authUser.projectRole == RoleType.EDITOR || store.authUser.isAdmin == 1 || store.currentProject.owner.id == store.authUser.id), href: routePrefix + '/settings', icon: CogIcon, current: route.path == routePrefix + '/settings', subItems: [] }
]

console.log(import.meta.env.VITE_NR_ACTIVATED)
const refdashboard = ref(new DashboardModel())
const refdashboardCollection = ref(new ModelCollection<DashboardModel>())

const dashboardCrudController = new BaseController<DashboardModel>(
  '/dashboards',
  [{ name: 'photo' }],
  refdashboard.value,
  store.authUser.token['token'],
)
dashboardCrudController.setRoutePrefix(routePrefix)

async function initNav() {
  const regex = new RegExp('^/projects//*')
  if (regex.test(route.path) && route.path != "/projects/create") {
    await RouteService.getProjectInfos(route)
    refdashboardCollection.value = await dashboardCrudController.index(1, 10, '', { 'stared': '1' })
    await updateDashboardsList()
    navigation.value = projectNav
  } else {
    navigation.value = mainNav
  }


}
async function updateDashboardsList() {
  for (const dashboard of refdashboardCollection.value.data) {
    const splittedName = dashboard.name.split('.')
    projectNav[1].subItems!.push({
      name: splittedName[splittedName.length - 1],
      tooltip: splittedName.length > 1 ? dashboard.name : undefined,
      visible: true,
      href: routePrefix + '/dashboards/' + dashboard.id,
      icon: TemplateIcon,
      current: route.path == '/projects'
    })
  }
}
/**
 * Layout style
 *
 *
 */
const sidebarOpen = ref(false)

const hasCustomLogo = computed(() => {
  return store.publicAppSettings.appIcon != null
})

const hasProfilePicture = computed(() => {
  return store.authUser.photo != null
})


async function logout() {
  localStorage.removeItem("authUser")

  await router.isReady()

  for (let attempts = 0; attempts < 3; attempts++) {
    const result = await router.push('/login');
    if (!result) break
  }
}

async function profile() {
  router.push('/users/profile/' + store.authUser.id)
}

async function toggleMenu() {
  refShowSideBarDesktop.value = !refShowSideBarDesktop.value
  store.showSideBarDesktop = refShowSideBarDesktop.value
}

initNav()
</script>

<style>
#layout {
  background-size: cover;
}
/* Hide scrollbar for Chrome, Safari and Opera */
#layout::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
#layout {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
