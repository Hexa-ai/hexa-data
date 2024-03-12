<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft>
        <SearchNav v-model="refSearch"></SearchNav>
      </template>

      <template v-slot:menuRight class="p-3">
        <Btn v-if="store.authUser.isAdmin == 1 || store.currentProject.owner.id == store.authUser.id"
          :text="edit == true ? $t('cancel') : $t('edit')" :primary="false" :action="edit == true ? 'cancel' : 'update'"
          class="m-3" @click="edit = !edit"></Btn>
      </template>

      <template v-slot:default>
        <dialog ref="refShowVariableHistory" class="modal">
          <div class="modal-box w-11/12 max-w-5xl">
            <h3 class="font-bold text-lg">Historique {{ showVariableHistoryTarget?.c }}</h3>
            <div class="mt-4">
              <VarWarpChart v-if="showVariableHistoryTarget" :url="warp10Url" :class-name="showVariableHistoryTarget.c"
                :labels="showVariableHistoryTarget.l"
                :value-type="(showVariableHistoryTarget.l?.type === 'string' || showVariableHistoryTarget.l?.type === 'boolean' ? 4 : 1)"
                :unstyled="true"></VarWarpChart>
            </div>
            <div class="modal-action">
              <form method="dialog">
                <button class="btn">Close</button>
              </form>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        <dialog ref="refShowVariableInfos" class="modal">
          <div class="modal-box w-11/12 max-w-5xl">
            <h3 class="font-bold text-lg">{{ $t('tags.detailsOf') + ' ' + showVariableInfosTarget?.c }}</h3>
            <div class="mt-4" v-if="showVariableInfosTarget">
              <div class="mb-4">
                <label class="font-bold block mb-2">{{ $t('tags.mqttTopic') }}</label>
                <input type="text" class="input input-bordered w-full mb-1" v-model="showVariableInfosTarget.l.topic"/>
                <p class="text-gray-400">{{ $t('tags.mqttTopicDescription') }}</p>
              </div>
              <div class="mb-4">
                <label class="font-bold block mb-2">{{ $t('tags.warpScriptCode') }}</label>
                <textarea class="textarea textarea-bordered w-full mb-1" rows="5" v-model="showVariableInfosWarpScript"></textarea>
                <p class="text-gray-400">{{ $t('tags.warpScriptCodeDescription') }}</p>
              </div>
              <div>
                <label class="font-bold block mb-2">{{ $t('tags.labels') }}</label>
                <pre class="w-full mb-1">{{ showVariableInfosTarget.l }}</pre>
                <p class="text-gray-400">{{ $t('tags.labelsDescription') }}</p>
              </div>
            </div>
            <div class="modal-action">
              <form method="dialog">
                <button class="btn">Close</button>
              </form>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        <div class="m-3">
          <Loader v-if="loading"></Loader>
          <ItemListingCard v-else-if="variables.length" :items="variables">
            <template v-slot:default="{ item } : any">
              <div class="flex flex-col flex-grow max-w-4/5 whitespace-normal">
                <div class="flex">
                  <VariableIcon class="h-5 w-5 mr-1 text-gray-400" aria-hidden="true" />
                  <p class="text-sm font-medium text-gray-900">
                    {{ item.c }}
                  </p>
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatGtsLabels(item.l) }}
                </div>
              </div>

              <div class="flex flex-col text-sm hidden lg:block">
                <template v-if="item.v && item.v[0]">
                  <div style="
                      display: -webkit-box;
                      -webkit-line-clamp: 4;
                      -webkit-box-orient: vertical;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    ">
                    {{ $t('tags.lastValue') }}
                    <strong>{{ item.v[0][1] }}</strong>
                  </div>
                  <div class="text-gray-400">
                    {{ dayjs(item.v[0][0] / 1000).format('YYYY-MM-DD HH:mm:ss') }}
                  </div>
                </template>

                <template v-else> {{ $t('tags.noLastValue') }} </template>
              </div>

              <div class="flex flex-col justify-center px-5 hidden md:block" style="min-width: 110px;">
                <div>
                  <div v-if="item.l.type" class="badge badge-primary">{{ item.l.type }}</div>
                </div>
                <div v-if="item.l['unit']" class="mt-1">
                  <div class="badge badge-secondary">{{ item.l['unit'] }}</div>
                </div>
              </div>

              <div class="flex items-center">
                <Btn :text="$t('tags.showDetails')" :action="'code'" :primary="false" @click="showVariableInfos(item)">
                </Btn>
                <Btn :text="$t('tags.showHistory')" :action="'chart'" :primary="false" class="ml-2"
                  @click="showVariableHistory(item)"></Btn>
                <Btn v-if="isEditor && edit" :text="$t('remove')" :action="'delete'" :primary="false" class="ml-2"
                  @click="removeVariable(item)"></Btn>
              </div>
            </template>
          </ItemListingCard>
          <div class="mt-5 text-gray-500" v-else>
            {{ $t('tags.noVariableOnProject') }}
          </div>
        </div>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { inject, ref, computed, PropType, watch, onUnmounted } from 'vue'
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
import ItemListingCard from '@/components/ItemListingCard.vue'
import dayjs from 'dayjs'
import bus from '@/services/bus'
import { autoCloseTags } from '@codemirror/lang-javascript'

// Create new type interface for variable
interface Variable {
  c: string
  l: { [key: string]: string | number }
  v: Array<Array<[number, number]>>
}

const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const { t } = useI18n()
const loading = ref(true)
const variables = ref([] as Array<Variable>)
const edit = ref(false)

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
 * SHOW VARIABLE HISTORY
 */
const refShowVariableHistory: any = ref(null)
const showVariableHistoryTarget = ref(null as Variable | null)
const showVariableHistory = (variable: Variable) => {
  refShowVariableHistory.value.showModal()
  showVariableHistoryTarget.value = variable
}

/*
 * SHOW VARIABLE INFOS
 */
const refShowVariableInfos: any = ref(null)
const showVariableInfosTarget = ref(null as Variable | null)
const showVariableInfosWarpScript = ref('')
const showVariableInfos = (variable: Variable) => {
  refShowVariableInfos.value.showModal()
  showVariableInfosTarget.value = variable
  showVariableInfosWarpScript.value = `{
  'token'  $readToken
  'class'  '` + variable.c + `'
  'labels' '` + JSON.stringify(variable.l) + `' JSON->
  'end' $end // timestamp or ISO8601 string
  'start' $interval  // timestamp or ISO8601 string
} FETCH`
}

const warp10Url =
  window.location.origin + import.meta.env.VITE_API_PREFIX + '/warp10/' + route.params.id

const removeVariable = (variable: Variable) => {
  bus.emit('dialog.confirm', {
    message: t('tags.deleteMessage'),
    confirmText: t('tags.deleteConfirmButton'),
    confirmClass: 'btn-error',
    onConfirm: async () => {
      await axios.post('/projects/' + props.project.id + '/warp10/variables/delete', {
        variables: [
          {
            classname: variable.c,
            labels: variable.l,
          },
        ],
      })
      await refresh()
      bus.emit('toast', { message: t('tags.deleteConfirmation') })
    }
  })
}
const isEditor = computed(() => {
  return (
    store.authUser.projectRole == RoleType.EDITOR ||
    store.authUser.isAdmin == 1 ||
    store.currentProject.owner.id == store.authUser.id
  )
})

const formatGtsLabels = (labels: Array<any>) => {
  const excluded = ['.app', 'type', 'projectUuid', 'topic', 'unit']
  return Object.entries(labels)
    .filter(([key]) => !excluded.includes(key))
    .map(([key, value]) => `${key} = ${value}`)
    .join(', ')
}

const formatJson = (labels: Array<any>) => {
  return JSON.stringify(labels)
}

/*
 * DATA FETCHING / SEARCH / REFRESH
 */
const refSearch = ref('')
const refresh = async () => {
  const result = await axios.get(
    '/projects/' + props.project.id + '/warp10/variables?search=' + refSearch.value
  )

  variables.value = result.data.result[0]
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
}, 5000)

// Clear interval on unmount
onUnmounted(() => {
  clearInterval(refreshInterval)
})
</script>
