<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft>
        <div role="tablist" class="tabs w-full tabs-lifted tabs-lg ml-2 ">
          <a role="tab" :class="'tab ' + (tabs.active === 0 ? 'tab-active' : '')"
            @click="tabs.active = 0">Paramètres</a>
          <a role="tab" :class="'tab ' + (tabs.active === 1 ? 'tab-active' : '')" @click="tabs.active = 1">Jetons</a>
          <a role="tab" :class="'tab ' + (tabs.active === 2 ? 'tab-active' : '')" @click="tabs.active = 2">Services</a>
        </div>
      </template>

      <template v-slot:menuRight>
        <div class="join mt-4 ml-2 mr-2">
          <button v-if="edit" @click="remove" class="btn btn-smd btn-error join-item">{{ $t('remove') }}</button>
          <button v-if="store.authUser.isAdmin == 1 || store.currentProject.owner.id == store.authUser.id"
            @click="edit = !edit" :class="'btn btn-smd ' + (edit ? 'join-item' : '')">

            <svg v-if="edit" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </button>
        </div>
      </template>

      <template v-slot:default>
        <div class="p-4" v-if="project && project.id">
          <div v-show="tabs.active === 0">
            <Parameters :project="project" :edit="edit" @updated="refresh"></Parameters>
          </div>
          <div v-show="tabs.active === 1">
            <Tokens :project="project" :edit="edit" @updated="refresh"></Tokens>
          </div>
          <div v-show="tabs.active === 2">
            <Services :project="project" :edit="edit" @updated="refresh"></Services>
          </div>
        </div>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { inject, ref, nextTick } from 'vue'
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from './../../store/Store'
import Services from './Show/Services.vue'
import Parameters from './Show/Parameters.vue'
import Tokens from './Show/Tokens.vue'
import axios from '@/services/axios'
import bus from '@/services/bus'
const route = useRoute()
const router = useRouter()
const store: Store = inject('store')!
const { t } = useI18n()

/*
 * Navigation and interface
 */
const breadCrumb: any = ref([])
const edit = ref(false)
const tabs = ref({
  active: 0,
})

/*
 * Project data management
 */
const project: any = ref({})
const refresh = () => {
  axios.get('/projects/' + route.params.id).then((response) => {
    for (const key in response.data) {
      if (response.data.hasOwnProperty(key)) project.value[key] = response.data[key];
    }

    breadCrumb.value = [
      { name: 'Projects', href: '/projects' },
      { name: store.currentProject.name, href: '/projects/' + route.params.id },
      { name: t('settings'), href: '/projects/' + route.params.id + '/settings' },
    ]
  })
}
refresh()

/*
 * Actions management
 */
async function remove() {
  bus.emit('dialog.confirm', {
    title: t('projectInfos.projectDeleteConfirmTitle'),
    message: t('projectInfos.projectDeleteConfirmMsg'),
    cancelText: t('cancel'),
    confirmText: t('remove'),
    confirmClass: 'btn-error',
    onConfirm: async () => {
      await axios.post('projects/' + project.value.id + '/services/grafana', {
        grafanaEnabled: false
      })
      await axios.post('projects/' + project.value.id + '/services/node-red', {
        nodeRedEnabled: false
      })

      await axios.delete('/projects/' + route.params.id)
      router.push('/projects')
      setTimeout(() => {
        bus.emit('toast')
      })
    }
  })
}
</script>
