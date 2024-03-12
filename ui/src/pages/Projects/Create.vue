<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="refBreadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft> </template>
      <template v-slot:menuRight class="p-3"> </template>
      <template v-slot:default>
        <div class="m-3">
          <div class="mb-3">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ $t('projectIndex.newProject') }}
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ $t('projectInfos.newProjectDescription') }}
            </p>
          </div>

          <div class="grid grid-cols-6 gap-y-6 gap-x-4">
            <label class="col-span-6 lg:col-span-3">
              <span class="label label-text">Nom</span>
              <input type="text" v-model="refProject.name" class="input input-bordered w-full" />
            </label>
          </div>
          <div class="mt-4 grid grid-cols-6 gap-y-6 gap-x-4">
            <label class="col-span-6 lg:col-span-3">
              <span class="label label-text">Description</span>
              <textarea v-model="refProject.description" class="textarea textarea-bordered w-full"></textarea>
            </label>
          </div>
          <div class="mt-4 grid grid-cols-6 gap-y-6 gap-x-4">
            <label class="col-span-6 lg:col-span-3">
              <span class="label label-text">
                Image
                <span class="text-gray-500 font-normal italic">PNG, JEPG, SVG jusqu'à 5MB</span>
              </span>
              <input type="file" @change="onFilePicked" class="file-input file-input-bordered w-full" />
              <img v-if="photoUrl" class="w-96 mt-2 rounded-lg" :src="photoUrl" />
            </label>
          </div>

          <button @click="create" class="mt-6 btn btn-primary" :disabled="loading">
            <span v-show="loading" class="loading loading-spinner"></span>
            {{ $t('save') }}
          </button>
        </div>
      </template>
    </BaseLayoutVue>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { inject, ref } from 'vue'
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from '../../store/Store'
import ProjectModel from '../../Models/ProjectModel'
import { BaseController } from './../../Classes/BaseController'
import { RouteService } from '../../Classes/RouteService'
import bus from '@/services/bus'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const store: Store = inject('store')!
const refBreadCrumb = ref([{ name: t('navigation.projects'), href: '/projects' }])

const refProject = ref(new ProjectModel())

const loading = ref(false)

/*
 * Image upload management
 */
const photoSource = ref(null)
const photoUrl = ref(null)
const onFilePicked = (event: any) => {
  const files = event.target.files
  if (files && files[0]) {
    photoSource.value = files[0]
    const fileReader = new FileReader()
    fileReader.onload = (e: any) => {
      photoUrl.value = e.target.result
    };
    fileReader.readAsDataURL(files[0])
  }
}

const crudController = new BaseController<ProjectModel>(
  '/projects',
  [{ name: 'photo' }],
  refProject.value,
  store.authUser.token['token']
)

async function init() {
  await RouteService.getProjectInfos(route)
  refBreadCrumb.value = [
    { name: t('navigation.projects'), href: '/projects' },
    { name: t('projectIndex.newProject'), href: '/projects/create' },
  ]
}

async function create() {
  try {
    loading.value = true
    await crudController.store(refProject.value)
    router.push('/projects')
    setTimeout(() => {
      bus.emit('toast')
    })
  } catch (err: any) {
    console.error(err)
    bus.emit('toast', {
      message: "Error : " + err.message,
      severity: 'error',
    })
  } finally {
    loading.value = false
  }
}

init()
</script>
