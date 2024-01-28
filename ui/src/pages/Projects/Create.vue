<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="refBreadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft> </template>
      <template v-slot:menuRight class="p-3"> </template>
      <template v-slot:default>
        <form
          class="space-y-8 divide-y divide-gray-200 m-3"
          action="#"
          method="POST"
          @submit.prevent="create"
        >
          <div class="space-y-8 divide-y divide-gray-200">
            <div>
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ $t('projectIndex.newProject') }}
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  {{ $t('projectInfos.newProjectDescription') }}
                </p>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('projectInfos.name')"
                    v-model="refProject!.name"
                    :isRequired="true"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('projectInfos.description')"
                    v-model="refProject!.description"
                    :isRequired="true"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('projectInfos.photo')"
                    :upload-text="$t('projectInfos.uploadText')"
                    :drag-and-drop-text="$t('projectInfos.dragAndDropText')"
                    :type-and-size-text="$t('projectInfos.typeAndSizeText')"
                    id="appIcon"
                    v-model="refProject!.photo"
                    v-model:fileToUploadValue="imageToUpload"
                    :isRequired="false"
                    :type="FieldType.FILE"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('projectInfos.adress')"
                    v-model="refProject!.adress"
                    :isRequired="false"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('projectInfos.lat')"
                    v-model="refProject!.lat"
                    :isRequired="false"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('projectInfos.long')"
                    v-model="refProject!.long"
                    :isRequired="false"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('projectInfos.l1')"
                    v-model="refProject!.l1"
                    :isRequired="false"
                    :isDisabled="false"
                    :values="['fr', 'en', 'de', 'en']"
                    :choices="['fr', 'en', 'de', 'en']"
                    :type="FieldType.SELECT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('projectInfos.l2')"
                    v-model="refProject!.l2"
                    :isRequired="false"
                    :isDisabled="false"
                    :values="['fr', 'en', 'de', 'en']"
                    :choices="['fr', 'en', 'de', 'en']"
                    :type="FieldType.SELECT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('projectInfos.l3')"
                    v-model="refProject!.l3"
                    :isRequired="false"
                    :isDisabled="false"
                    :values="['fr', 'en', 'de', 'en']"
                    :choices="['fr', 'en', 'de', 'en']"
                    :type="FieldType.SELECT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <Btn :text="$t('save')" :primary="true" class=""></Btn>
                </div>
              </div>
            </div>
          </div>
        </form>
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
import Btn from '../../components/Btn.vue'
import FieldType from '../../Contracts/FieldType'
import InputField from '../../components/InputField.vue'
import ProjectModel from '../../Models/ProjectModel'
import { BaseController } from './../../Classes/BaseController'
import { RouteService } from '../../Classes/RouteService'
import { Utils } from '../../Classes/Utils'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const store: Store = inject('store')!
const refBreadCrumb = ref([{ name: t('navigation.projects'), href: '/projects' }])
const edit = ref(false)

const refProject = ref(new ProjectModel())

const crudController = new BaseController<ProjectModel>(
  '/projects',
  [{ name: 'photo' }],
  refProject.value,
  store.authUser.token['token']
)

let imageToUpload = crudController.getFileList('photo')

async function init() {
  await RouteService.getProjectInfos(route)
  refBreadCrumb.value = [
    { name: t('navigation.projects'), href: '/projects' },
    { name: t('projectIndex.newProject'), href: '/projects/create' },
  ]
}

async function create() {
  await crudController.store(refProject.value)
  router.push('/projects')
}

init()
</script>
