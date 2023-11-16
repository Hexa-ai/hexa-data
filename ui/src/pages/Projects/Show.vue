<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft></template>
      <template v-slot:menuRight class="p-3">
        <Btn v-if="edit == true" :text="$t('remove')" :primary="true" class="m-3" @click="remove"></Btn>
        <Btn
          v-if="store.authUser.isAdmin==1 || store.currentProject.owner.id==store.authUser.id"
          :text="edit == true ? $t('cancel') : $t('edit')"
          :primary="false"
          :action="edit == true ?'cancel':'update'"
          class="m-3"
          @click="toggleEdit"
        ></Btn>
      </template>
      <template v-slot:default>
        <ComfirmPopup
          :title="$t('projectInfos.projectDeleteConfirmTitle')"
          :cancel-text="$t('cancel')"
          :confirm-text="$t('remove')"
          :msg="$t('projectInfos.projectDeleteConfirmMsg')"
          @comfirm="removeConfirmation"
          v-model="isOpen"
        ></ComfirmPopup>
        <form
          class="m-3 space-y-8 divide-y divide-gray-200"
          action="#"
          method="POST"
          @submit.prevent="update"
        >
          <div class="space-y-8 divide-y divide-gray-200">
            <div>
              <div>
                <h3
                  class="text-lg leading-6 font-medium text-gray-900"
                >{{ $t('projectInfos.settings') }}</h3>
                <p class="mt-1 text-sm text-gray-500"></p>
              </div>
              <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-2">
                  <InputField
                    :title="$t('projectInfos.name')"
                    v-model="refProject!.name"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-6">
                  <InputField
                    :title="$t('projectInfos.description')"
                    v-model="refProject!.description"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-3">
                  <InputField
                    :title="$t('projectInfos.photo')"
                    :upload-text="$t('projectInfos.uploadText')"
                    :drag-and-drop-text="$t('projectInfos.dragAndDropText')"
                    :type-and-size-text="$t('projectInfos.typeAndSizeText')"
                    id="appIcon"
                    v-model="refProject!.photo"
                    v-model:fileToUploadValue="imageToUpload"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.FILE"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-2">
                  <InputField
                    :title="$t('projectInfos.uuid')"
                    v-model="refProject!.uuid"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-3">
                  <InputField
                    :title="$t('projectInfos.adress')"
                    v-model="refProject!.adress"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-1">
                  <InputField
                    :title="$t('projectInfos.lat')"
                    v-model="refProject!.lat"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-1">
                  <InputField
                    :title="$t('projectInfos.long')"
                    v-model="refProject!.long"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-1">
                  <InputField
                    :title="$t('projectInfos.l1')"
                    v-model="refProject!.l1"
                    :choices="languages"
                    :values="['fr','en','de','en']"
                    :choice="['fr','en','de','en']"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.SELECT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-1">
                  <InputField
                    :title="$t('projectInfos.l2')"
                    v-model="refProject!.l2"
                    :choices="languages"
                    :values="['fr','en','de','en']"
                    :choice="['fr','en','de','en']"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.SELECT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-1">
                  <InputField
                    :title="$t('projectInfos.l3')"
                    v-model="refProject!.l3"
                    :choices="languages"
                    :values="['fr','en','de','en']"
                    :choice="['fr','en','de','en']"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :type="FieldType.SELECT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-2">
                  <Btn v-if="edit" :text="$t('save')" :primary="true" class=""></Btn>
                </div>
              </div>
              <div class="mt-5 pt-5 sm:border-t sm:border-gray-200">
                <h3 class="text-lg italic leading-6 font-medium text-gray-900" >
                  Tokens persistants
                </h3>
                <p class="mt-1 text-sm text-gray-500">Créer et gérer des tokens peristants pour accéder directement à la base de données Warp10.</p>
              </div>
              <div v-if="edit">
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-2">
                    <InputField
                      title="Durée de validité des tokens"
                      v-model="persistentTokensDuration"
                      :choices="['1 an', '2 ans', '3 ans', '4 ans', '5 ans', '6 ans', '7 ans', '8 ans', '9 ans', '10 ans']"
                      :values="[31536000, 63072000, 94608000, 126144000, 157680000, 189216000, 220752000, 252288000, 283824000, 315360000]"
                      :type="FieldType.SELECT"
                    ></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-2">
                    <Btn :text="refProject!.persistentTokenIssuance ? 'Regénérer les tokens persistants' : 'Générer des tokens persistants'" :primary="true" @click="generatePersistentTokens"></Btn>
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-6">
                    <InputField
                      :title="$t('projectInfos.readToken')"
                      v-model="refProject!.persistentReadToken"
                      :isRequired="false"
                      :isDisabled="true"
                      :type="FieldType.TEXT"
                    ></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-6">
                    <InputField
                      :title="$t('projectInfos.writeToken')"
                      v-model="refProject!.persistentWriteToken"
                      :isRequired="false"
                      :isDisabled="true"
                      :type="FieldType.TEXT"
                    ></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-2">
                    <InputField
                      :title="$t('projectInfos.tokenIssuance')"
                      v-model="refProject!.persistentTokenIssuance"
                      :isRequired="false"
                      :isDisabled="true"
                      :type="FieldType.TEXT"
                    ></InputField>
                  </div>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                  <div class="col-span-6 md:col-span-2">
                    <InputField
                      :title="$t('projectInfos.tokenExpiry')"
                      v-model="refProject!.persistentTokenExpiry"
                      :isRequired="false"
                      :isDisabled="true"
                      :type="FieldType.TEXT"
                    ></InputField>
                  </div>
                </div>
              </div>
              <div class="mt-5 pt-5 sm:border-t sm:border-gray-200">
                <h3
                  class="text-lg italic leading-6 font-medium text-gray-900"
                >{{ $t('projectInfos.exportTitle') }}</h3>
                <p class="mt-1 text-sm text-gray-500">{{ $t('projectInfos.exportMsg') }}</p>
              </div>
              <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                <Btn
                  v-if="refProject!.exportLink=='' || refProject!.exportLink==null"
                  :text="$t('projectInfos.settingsExport')"
                  :primary="false"
                  class="col-span-6 md:col-span-2"
                  v-on:click="exportSettings"
                ></Btn>
                <MiniLoader v-if="(refProject!.exportLink=='' || refProject!.exportLink==null ) && refExportSettingsEnabled==true"></MiniLoader>
                <a
                  v-if="refProject!.exportLink!='' && refProject!.exportLink!=null"
                  class="flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300 text-gray-500"
                  :href="refProject!.exportLink"
                  download
                >{{ $t('projectInfos.downloadSettingsFile') }}</a>
              </div>
              <div class="mt-2 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-6">
                  <ExportCurl
                    :read-token="refProject!.readToken"
                    :write-token="refProject!.writeToken"
                  ></ExportCurl>
                </div>
              </div>
              <div class="mt-5 pt-5 sm:border-t sm:border-gray-200">
                <h3
                  class="text-lg italic leading-6 font-medium text-gray-900"
                >{{ $t('projectInfos.importTitle') }}</h3>
                <p class="mt-1 text-sm text-gray-500">{{ $t('projectInfos.importMsg') }}</p>
              </div>
              <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-3">
                  <InputField
                    :title="$t('projectInfos.settingsImport')"
                    :upload-text="$t('projectInfos.uploadText')"
                    :drag-and-drop-text="$t('projectInfos.dragAndDropText')"
                    :type-and-size-text="$t('projectInfos.typeAndSizeTextSettingsFile')"
                    id="appArchive"
                    v-model="refProject!.archive"
                    v-model:fileToUploadValue="archiveToUpload"
                    :isRequired="false"
                    :type="FieldType.FILE"
                  ></InputField>
                  <div v-if="archiveToUpload!=undefined" class="flex flex-raw mt-3">
                    <Btn
                      :text="$t('projectInfos.comfirmImport')"
                      :primary="false"
                      class
                      v-on:click="importSettings"
                    ></Btn>
                     <MiniLoader v-if="( archiveToUpload!=undefined ) && refImportSettingsEnabled==true"></MiniLoader>
                    <p
                      class="pl-3 pt-3 text-sm text-gray-500"
                    >{{ $t('projectInfos.importSettingsInfos') }}</p>
                  </div>
                </div>
              </div>
              <div class="mt-2 grid grid-cols-6 gap-y-6 gap-x-4">
                <div class="col-span-6 md:col-span-6">
                  <ImportCurl
                    :read-token="refProject!.readToken"
                    :write-token="refProject!.writeToken"
                  ></ImportCurl>
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
import { inject, ref } from 'vue';
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from './../../store/Store'
import ProjectModel from './../../Models/ProjectModel';
import Btn from './../../components/Btn.vue'
import InputField from './../../components/InputField.vue';
import FieldType from './../../Contracts/FieldType';
import { BaseController, ModelCollection } from './../../Classes/BaseController'
import { RouteService } from '../../Classes/RouteService'
import ComfirmPopup from '../../components/ComfirmPopup.vue'
import languages from '../../Contracts/languages';
import ExportCurl from '../../components/ExportCurl.vue';
import ImportCurl from '../../components/ImportCurl.vue';
import MiniLoader from '../../components/MiniLoader.vue';
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects'
const breadCrumb = ref([{ name: 'Projects', href: '/projects' }])
const { t } = useI18n()
const isOpen = ref(false)

const refProject = ref(new ProjectModel())
const refProjectCollection = ref(new ModelCollection<ProjectModel>())
const persistentTokensDuration = ref(31536000)
const refExportSettingsEnabled = ref(false)
const refImportSettingsEnabled = ref(false)
let setTimourImportExport:any
const edit = ref(false)

const crudController = new BaseController<ProjectModel>(
  '',
  [{ name: 'photo' }, { name: 'archive' }],
  refProject.value,
  store.authUser.token['token'],
)

crudController.setRoutePrefix(routePrefix)

let imageToUpload = crudController.getFileList('photo')
let archiveToUpload = crudController.getFileList('archive')

async function init() {
  await RouteService.getProjectInfos(route)
  refProject.value = await crudController.show(Number(route.params.id))
  if(refProject.value.importExportCmd==0 && (refExportSettingsEnabled.value==true || refImportSettingsEnabled.value==true)){
    refExportSettingsEnabled.value=false
    refImportSettingsEnabled.value=false
    clearInterval(setTimourImportExport)
    router.go()
  }
  breadCrumb.value = [{ name: 'Projects', href: '/projects' }, { name: store.currentProject.name, href: routePrefix + '/' + route.params.id }, { name: t('settings'), href: routePrefix + '/' + route.params.id + '/settings' }]
}
async function generatePersistentTokens() {
  await crudController.post(route.params.id + '/generatePersistentTokens', { duration: persistentTokensDuration.value })
  edit.value = false
  init()
}
async function exportSettings() {
  crudController.get('export/' + route.params.id)
  refExportSettingsEnabled.value=true
  setTimourImportExport=setInterval(()=>{init()},3000)
}
async function importSettings() {
  crudController.post('import/' + route.params.id, null, [{ name: 'archive', field: archiveToUpload }],)
  refImportSettingsEnabled.value=true
  setTimourImportExport=setInterval(()=>{init()},3000)
}
async function update() {
  await crudController.update(refProject.value, true)
  edit.value = false
  init()
}
function toggleEdit() {
  edit.value = !edit.value
  if (edit.value == false) {
    init()
  }
}
async function remove() {
  isOpen.value = true
}
async function removeConfirmation() {
  isOpen.value = false
  await crudController.remove(refProject.value.id)
  router.push(routePrefix)
}

init()
</script>
