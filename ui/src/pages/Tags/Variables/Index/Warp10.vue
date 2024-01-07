<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft>
        <SearchNav v-model="refSearch"></SearchNav>
      </template>
      <template v-slot:default>
        <ComfirmPopup
          title="Suppresion de variable"
          :cancel-text="$t('cancel')"
          :confirm-text="$t('remove')"
          msg="Etes-vous sûr de vouloir supprimer cette variable ? Toutes les données seront supprimées."
          @comfirm="doRemove"
          v-model="askingRemove"
        ></ComfirmPopup>

        <TransitionRoot appear :show="showVariableVisible" as="template">
          <Dialog as="div" @close="closeShowVariable" :initialFocus="showVariableFocusRef">
            <div ref="showVariableFocusRef" class="fixed inset-0 z-10 overflow-y-auto">
              <div class=" px-4 text-center">
                <span class="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

                <TransitionChild
                  as="template"
                  enter="duration-300 ease-out"
                  enter-from="opacity-0 scale-95"
                  enter-to="opacity-100 scale-100"
                  leave="duration-200 ease-in"
                  leave-from="opacity-100 scale-100"
                  leave-to="opacity-0 scale-95"
                >
                  <div
                    v-if="showVariableTarget"
                    class="inline-block w-3/5 p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white border-2 border-gray-200 shadow-xl rounded-2xl"
                  >
                    <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900"
                      >Affichage de la variable {{ showVariableTarget.c }}</DialogTitle
                    >
                    <div class="mt-2">
                      <VarWarpChart
                        v-if="showVariableTarget"
                        class="m-3"
                        :url="warp10Url"
                        :class-name="showVariableTarget.c"
                        :labels="showVariableTarget.l"
                        :value-type="1"
                      ></VarWarpChart>
                    </div>

                    <div class="mt-4 flex">
                      <div class="flex-grow"></div>
                      <Btn
                        class="ml-5"
                        :primary="false"
                        text="Fermer"
                        @click="closeShowVariable"
                      ></Btn>
                    </div>
                  </div>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </TransitionRoot>

        <Loader v-if="loading"></Loader>
        <div
          v-else
          class="bg-white shadow overflow-hidden sm:rounded-md m-3 divide-y divide-gray-200"
        >
          <div
            class="flex cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out"
            v-for="variable in variables"
            @click="showVariable(variable)"
          >
            <div class="flex flex-col flex-grow p-4">
              <div class="flex-grow flex">
                <VariableIcon class="flex-shrink-0 h-5 w-5 mr-1 text-gray-400" aria-hidden="true" />
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ variable.c }}
                </p>
              </div>
              <div class="flex-grow text-sm text-gray-500">
                {{ formatGtsLabels(variable.l) }}
              </div>
            </div>

            <div class="flex flex-col w-1/2 md:w-1/3" style="height: 72px">
              <Bar
                id="my-chart-id"
                style="width: 100%; height: 100%"
                :options="sparklines"
                :data="{
                  datasets: [
                    {
                      data: variable.v.map((v) => {
                        return { x: dayjs(v[0] / 1000).format('YYYY-MM-DDTHH:mm:ss'), y: v[1] }
                      }),
                    },
                  ],
                }"
              />
            </div>

            <div class="flex flex-col justify-center items-center p-4">
              <Btn
                v-if="isEditor"
                :text="$t('remove')"
                :action="'delete'"
                :primary="false"
                @click.stop="askRemove(variable)"
              ></Btn>
            </div>
          </div>
        </div>
        
        <div class="m-3" v-if="isEditor">
          <h3 class="text-lg mt-6 mb-2 font-medium text-gray-600">Logs Telegraf</h3>
          <pre class="text-gray-400">{{ logs }}</pre>
        </div>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { inject, ref, computed, PropType, watch, onUnmounted } from 'vue'
import { TransitionRoot, TransitionChild, Dialog, DialogTitle } from '@headlessui/vue'
import VarWarpChart from '@/components/VarWarpChart.vue'
import ProjectModel from '@/Models/ProjectModel'
import BaseLayoutVue from '@/layouts/BaseLayout.vue'
import { useRoute } from 'vue-router'
import Store from '@/store/Store'
import SearchNav from '@/components/SearchNav.vue'
import Btn from '@/components/Btn.vue'
import Loader from '@/components/Loader.vue'
import { VariableIcon } from '@heroicons/vue/outline'
import RoleType from '@/Contracts/RoleType'
import axios from '@/services/axios'
import ComfirmPopup from '@/components/ComfirmPopup.vue'
import dayjs from 'dayjs'

import { Bar } from 'vue-chartjs'
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm'
import { Chart as ChartJS, Tooltip, BarElement, LinearScale, TimeScale } from 'chart.js'
ChartJS.register(Tooltip, BarElement, LinearScale, TimeScale)

// Create new type interface for variable
interface Variable {
  c: string
  l: {[key: string]: string | number}
  v: Array<Array<[number, number]>>
}

const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const { t } = useI18n()
const loading = ref(true)
const variables = ref([] as Array<Variable>)
const logs = ref('')

const breadCrumb = ref([
  { name: 'Projects', href: '/projects' },
  { name: store.currentProject.name, href: routePrefix },
  { name: t('navigation.variables'), href: routePrefix + '/variables' },
])

const props = defineProps({
  project: {
    type: Object as PropType<ProjectModel>,
    required: true,
  },
})

/*
 * SHOW VARIABLE INTO POPUP
 */
const showVariableVisible = ref(false)
const showVariableFocusRef = ref(null)
const showVariableTarget = ref(null as Variable | null)
const showVariable = (variable: Variable) => {
  showVariableVisible.value = true
  showVariableTarget.value = variable
}
const closeShowVariable = () => {
  showVariableVisible.value = false
}
const warp10Url =
  window.location.origin + import.meta.env.VITE_API_PREFIX + '/warp10/' + route.params.id

/*
 * REMOVE VARIABLE CONFIRMATION
 */
const askingRemove = ref(false)
let removeVariable: Variable | null = null
const askRemove = (variable: Variable) => {
  askingRemove.value = true
  removeVariable = variable
}
const doRemove = async () => {
  if (removeVariable) {
    // Convert variable.l labels into query string
    const labels = Object.entries(removeVariable.l)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    await axios.delete(
      '/projects/' + props.project.id + '/warp10/variables/' + removeVariable.c + '?' + labels
    )
    askingRemove.value = false
    await refresh()
  }
}
const isEditor = computed(() => {
  return (
    store.authUser.projectRole == RoleType.EDITOR ||
    store.authUser.isAdmin == 1 ||
    store.currentProject.owner.id == store.authUser.id
  )
})

const formatGtsLabels = (labels: Array<any>) => {
  return Object.entries(labels)
    .filter(
      ([key]) => key !== '.app' && key !== 'source' && key !== 'host' && key !== 'projectUuid'
    )
    .map(([key, value]) => `${key} = ${value}`)
    .join(', ')
}

/*
 * SPARKLINE SETUP
 */
const sparklines = ref({})
const setup = () => {
  sparklines.value = {
    backgroundColor: '#202937',
    color: '#ffffff',
    maxBarThickness: 6,
    animation: false,
    scales: {
      y: {
        grid: {
          offset: false,
        },
      },
      x: {
        type: 'time',
        display: false,
        time: {
          unit: 'minutes',
          round: 'minutes',
        },
        tiks: {
          source: 'data',
        },
        min: dayjs().subtract(60, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
        max: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      },
    },
    options: {
      plugins: {
        tooltip: {
          enabled: true,
        },
      },
    },
  }
}
setup()

/*
 * DATA FETCHING / SEARCH / REFRESH
 */
const refSearch = ref('')
const refresh = async () => {
  const result = await axios.get('/projects/' + props.project.id + '/warp10/variables?search=' + refSearch.value)

  variables.value = result.data.result[0]
  logs.value = result.data.logs
  loading.value = false
}

let timeoutId: number | null = null
const debouncedRefresh = () => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(refresh, 500)
}

refresh()
watch(refSearch, async () => {
  await debouncedRefresh()
})

const refreshInterval = setInterval(async () => {
  await debouncedRefresh()
  setup()
}, 5000)

// Clear interval on unmount
onUnmounted(() => {
  clearInterval(refreshInterval)
})
</script>
