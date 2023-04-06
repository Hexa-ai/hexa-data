<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="refBreadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft>
        <SearchNav class="h-full" v-model="refSearch"></SearchNav>
      </template>
      <template v-slot:menuRight class="p-3">
      </template>
      <template v-slot:default>
        <div class="mt-6" v-if="(store.authUser.projectRole == RoleType.EDITOR || store.authUser.isAdmin == 1 || store.currentProject.owner.id == store.authUser.id)">
          <div class="m-3">
            <InputField :title="''" :upload-text="$t('projectInfos.uploadText')"
              :drag-and-drop-text="$t('projectInfos.dragAndDropText')"
              :type-and-size-text="''" id="imgBg" v-model="refDocument!.file"
              v-model:fileToUploadValue="fileToUpload"
              :isRequired="false"
              :isDisabled="!(store.authUser.projectRole == RoleType.USER || store.authUser.projectRole == RoleType.EDITOR || store.authUser.isAdmin == 1 || store.currentProject.owner.id == store.authUser.id)"
              :type="FieldType.FILE"
              @update:file-to-upload-value="create"></InputField>

          </div>
        </div>
        <div class="bg-white shadow overflow-hidden sm:rounded-md m-3">
          <ComfirmPopup
          :title="$t('documents.deleteConfirmTitle')"
          :cancel-text="$t('cancel')"
          :confirm-text="$t('remove')"
          :msg="$t('documents.deleteConfirmMsg')"
          @comfirm="removeConfirmation"
          v-model="refIsOpen"
          ></ComfirmPopup>
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="document in refDocumentCollection.data" :key="document.id">

              <div class="px-4 py-4 sm:px-6 sm:flex">
                <div v-html="getIcon(document.name).svg" class="h-7 w-7 mt-2"></div>
                <div class="mt-2 sm:flex sm:flex-grow sm:justify-between">
                  <div class="sm:flex-col">
                    <a class="flex items-center text-sm text-gray-900" :href="document.file.url" :download="document.name">
                      {{ document.name }}
                    </a>
                    <p class="flex items-center text-xs text-gray-500">
                      {{ new Date(Date.parse(document.updatedAt)).toLocaleString() }}
                    </p>
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    {{ humanFileSize(document.file.size) }}
                  </div>
                </div>
                <Btn
                    v-if="store.authUser.projectRole == RoleType.EDITOR || store.authUser.isAdmin == 1 || store.currentProject.owner.id == store.authUser.id"
                    :text="$t('remove')"
                    :action="'delete'"
                    :primary="false" class="m-3" @click="remove(document.id)"></Btn>
              </div>
            </li>
          </ul>
        </div>
        <Pagination :pagination="refDocumentCollection.pagination"></Pagination>
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
import DocumentModel from '../../Models/DocumentModel';
import { StarIcon, TemplateIcon } from '@heroicons/vue/outline'
import { RouteService } from '../../Classes/RouteService';
import SearchNav from '../../components/SearchNav.vue';
import RoleType from '../../Contracts/RoleType';
import { getIcon } from 'material-file-icons';

import ComfirmPopup from '../../components/ComfirmPopup.vue'

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const refProjectInfo = ref(store.currentProject)
const { t } = useI18n()
const refBreadCrumb = ref([{ name: 'Projects', href: '/projects' }])
const refIsOpen = ref(false)
const refIdToRemove = ref()
const refSearch = ref('')
const refDocument = ref(new DocumentModel())
const refDocumentCollection = ref(new ModelCollection<DocumentModel>())

const documentCrudController = new BaseController<DocumentModel>(
  '/documents',
  [{ name: 'file' }],
  refDocument.value,
  store.authUser.token['token'],
)

let fileToUpload = documentCrudController.getFileList('file')

documentCrudController.setRoutePrefix('/projects/' + String(route.params.id))

init()

async function init() {
  refProjectInfo.value = await RouteService.getProjectInfos(route)

  refBreadCrumb.value = [{ name: 'Projects', href: '/projects' }, { name: refProjectInfo.value.name, href: routePrefix }, { name: t('navigation.dashboards'), href: routePrefix + '/dashboards' }]
  const page = route.query['page'] ? Number(route.query['page']) : 1
  refDocumentCollection.value = await documentCrudController.index(page, 10, refSearch.value, {type:'0'})
}
async function remove(id:number) {
   refIsOpen.value=true
   refIdToRemove.value=id
}
async function removeConfirmation() {
  refIsOpen.value=false
  await documentCrudController.remove(refIdToRemove.value)
  init()
}
async function create() {
  await documentCrudController.store(refDocument.value)
  init()
  //router.push(routePrefix + '/dashboards/create')
}
watch(() => route.query['page'], () => {
  init()
});
watch(() => refSearch.value, () => {
  init()
});
function humanFileSize(size: number) {
  var i: number = Math.floor(Math.log(size) / Math.log(1024));
  return Number((size / Math.pow(1024, i)).toFixed(2)) * 1 + ' ' + ['Bytes', 'kB', 'MB', 'GB', 'TB'][i];
};
</script>
