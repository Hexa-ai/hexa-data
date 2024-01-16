<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft>
        <SearchNav v-model="refSearch"></SearchNav>
      </template>
      <template v-slot:menuRight class="p-3">
        <Btn
          v-if="store.authUser.isAdmin == 1 || store.currentProject.owner.id == store.authUser.id"
          :text="edit == true ? $t('cancel') : 'Afficher les logs'"
          :primary="false"
          :action="logs == true ? 'cancel' : 'search'"
          class="m-3"
          @click="logs = !logs"
        ></Btn>
        <Btn
          v-if="store.authUser.isAdmin == 1 || store.currentProject.owner.id == store.authUser.id"
          :text="edit == true ? $t('cancel') : $t('edit')"
          :primary="false"
          :action="edit == true ? 'cancel' : 'update'"
          class="m-3"
          @click="edit = !edit"
        ></Btn>
      </template>
      <template v-slot:default>
        <Dialog
          v-model:visible="showVariableVisible"
          modal
          :header="'Historique ' + showVariableTarget?.c"
          :style="{ width: '50rem' }"
          :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        >
          <VarWarpChart
            v-if="showVariableTarget"
            :url="warp10Url"
            :class-name="showVariableTarget.c"
            :labels="showVariableTarget.l"
            :value-type="1"
            :unstyled="true"
          ></VarWarpChart>

          <div class="flex">
            <div class="flex-grow"></div>
            <Btn class="ml-5" :primary="false" text="Fermer" @click="closeShowVariable"></Btn>
          </div>
        </Dialog>

        <Sidebar v-model:visible="logs" header="Logs Telegraf" position="bottom">
          <pre v-if="logsContent !== ''">{{ logsContent }}</pre>
          <div class="text-gray-500" v-else>
            Il n'y a aucun log d'enregistré pour ce projet.
          </div>
        </Sidebar>

        <ContentWrapper>
          <Loader v-if="loading"></Loader>
          <ItemListingCard
            v-else-if="variables.length"
            :items="variables"
            @itemClick="showVariable"
          >
            <template v-slot:default="{ item }">
              <div class="flex flex-col flex-grow">
                <div class="flex">
                  <VariableIcon class="h-5 w-5 mr-1 text-gray-400" aria-hidden="true" />
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ item.c }}
                    <div class="inline has-tooltip">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="inline w-4 h-4 text-gray-400"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                      </svg>
                      <span class="tooltip bg-black p-2 mt-9 rounded-md text-white">Topic: {{ item.l?.topic }}</span>
                    </div>
                  </p>
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatGtsLabels(item.l) }}
                </div>
              </div>

              <div class="flex flex-col text-sm w-40">
                <template v-if="item.v && item.v[0]">
                  <div>
                    Dernière valeur : <strong>{{ item.v[0][1] }}</strong>
                  </div>
                  <div class="text-gray-400">
                    le {{ dayjs(item.v[0][0] / 1000).format('YYYY-MM-DD HH:mm:ss') }}
                  </div>
                </template>
                <template v-else> Aucune valeur enregistrée </template>
              </div>
              
              <div class="flex flex-col justify-center px-5">
                <div v-if="item.l['#unit']">
                  <Tag :value="item.l['#unit']" rounded></Tag>
                </div>
              </div>

              <div class="flex flex-col justify-center items-center">
                <Btn
                  v-if="isEditor && edit"
                  :text="$t('remove')"
                  :action="'delete'"
                  :primary="false"
                  @click.stop="removeVariable(item)"
                ></Btn>
              </div>
            </template>
          </ItemListingCard>
          <div class="mt-5 text-gray-500" v-else>
            Il n'y a aucune variable dans ce projet. Commencez par envoyer des variables afin de
            pouvoir les consulter sur cette page.
          </div>
        </ContentWrapper>
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
import ContentWrapper from '@/components/Prime/ContentWrapper.vue'
import ItemListingCard from '@/components/Prime/ItemListingCard.vue'
import dayjs from 'dayjs'

import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
const confirm = useConfirm()
const toast = useToast()

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
const logs = ref(false)
const logsContent = ref('')

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

const removeVariable = (variable: Variable) => {
  confirm.require({
    message:
      'Souhaitez-vous vraiment supprimer cette variable ? Toutes les données seront supprimées',
    header: 'Suppression de la variable',
    rejectLabel: 'Annuler',
    acceptLabel: 'Supprimer',
    accept: async () => {
      await axios.post('/projects/' + props.project.id + '/warp10/variables/delete', {
        variables: [
          {
            classname: variable.c,
            labels: variable.l,
          },
        ],
      })
      await refresh()
      toast.add({
        detail: 'La suppression de la variable a été effectuée avec succès !',
        life: 3000,
      })
    },
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
  const excluded = ['.app', 'source', 'projectUuid', 'topic', '#unit']
  return Object.entries(labels)
    .filter(([key]) => !excluded.includes(key))
    .map(([key, value]) => `${key} = ${value}`)
    .join(', ')
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
  logsContent.value = result.data.logs
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
