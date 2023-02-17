<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft></template>
      <template v-slot:menuRight class="p-3">
        <Btn
          v-if="refEdit == true"
          :text="$t('Supprimer')"
          :primary="true"
          class="m-3"
          @click="remove"
        ></Btn>
        <Btn
          :text="refEdit == true ? $t('cancel') : $t('edit')"
          :action="refEdit == true ? 'cancel' : 'update'"
          :primary="false"
          class="m-3"
          @click="togglerefEdit"
        ></Btn>
      </template>
      <template v-slot:default>
        <ComfirmPopup
          :title="$t('users.userDeleteConfirmTitle')"
          :cancel-text="$t('cancel')"
          :confirm-text="$t('remove')"
          :msg="$t('users.userDeleteConfirmMsg')"
          @comfirm="removeConfirmation"
          v-model="isOpen"
        ></ComfirmPopup>
        <div class="mt-5 ml-3 grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div class="photo">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">{{ $t('users.profile') }}</h3>
              <p class="mt-1 text-sm text-gray-500"></p>
            </div>
            <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4 h-32">
              <div class="col-span-4">
                <img
                  v-if="refUser.photo != null"
                  class="h-32 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                  :src="refUser.photo.url"
                />
                <span
                  v-if="refUser.photo == null"
                  class="inline-block h-32 rounded-full overflow-hidden bg-gray-100"
                >
                  <svg class="h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
        <form class="m-3 space-y-8" action="#" method="POST" @submit.prevent="update">
          <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
            <div class="col-span-6 md:col-span-2">
              <InputField
                :title="$t('users.name')"
                v-model="refUser!.name"
                :isRequired="false"
                :isDisabled="!refEdit"
                :type="FieldType.TEXT"
              ></InputField>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
            <div class="col-span-6 md:col-span-2">
              <InputField
                :title="$t('users.email')"
                v-model="refUser!.email"
                :isRequired="false"
                :isDisabled="!refEdit"
                :type="FieldType.EMAIL"
              ></InputField>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
            <div class="col-span-6 md:col-span-2">
              <InputField
                :title="$t('users.number')"
                v-model="refUser!.number"
                :isRequired="false"
                :isDisabled="!refEdit"
                :type="FieldType.TEXT"
              ></InputField>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
            <div class="col-span-6 md:col-span-2">
              <InputField
                :title="$t('users.password')"
                v-model="refUser!.password"
                :confirm="true"
                :isRequired="false"
                :isDisabled="!refEdit"
                :type="FieldType.PASSWORD"
              ></InputField>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
            <div class="col-span-6 md:col-span-2">
              <InputField
                :title="$t('projectInfos.photo')"
                :upload-text="$t('projectInfos.uploadText')"
                :drag-and-drop-text="$t('projectInfos.dragAndDropText')"
                :type-and-size-text="$t('projectInfos.typeAndSizeText')"
                id="appIcon"
                v-model="refUser!.photo"
                v-model:fileToUploadValue="imageToUpload"
                :isRequired="false"
                :isDisabled="!refEdit"
                :type="FieldType.FILE"
              ></InputField>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
            <div class="col-span-6 md:col-span-1">
              <InputField
                :title="$t('users.language')"
                v-model="refUser.lang"
                :choices="languages"
                :values="languages"
                :isRequired="false"
                :isDisabled="!refEdit"
                :type="FieldType.SELECT"
              ></InputField>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
            <div class="col-span-6 md:col-span-2">
              <InputField
                :title="$t('users.activated')"
                v-model="refActivated"
                :isRequired="false"
                :isDisabled="!refEdit"
                :type="FieldType.CHECKBOX"
              ></InputField>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
            <div class="col-span-6 md:col-span-2">
              <InputField
                :title="$t('users.admin')"
                v-model="refAdmin"
                :isRequired="false"
                :isDisabled="!refEdit"
                :type="FieldType.CHECKBOX"
              ></InputField>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
            <div class="col-span-6 md:col-span-2">
              <InputField
                :title="$t('users.maxProjects')"
                v-model="refUser.maxProjects"
                :isRequired="false"
                :isDisabled="!refEdit"
                :type="FieldType.TEXT"
              ></InputField>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
            <div class="col-span-6 md:col-span-2">
              <InputField
                :title="$t('users.maxDevices')"
                v-model="refUser.maxDevices"
                :isRequired="false"
                :isDisabled="!refEdit"
                :type="FieldType.TEXT"
              ></InputField>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
            <div class="col-span-6 md:col-span-2">
              <InputField
                :title="$t('users.maxVariables')"
                v-model="refUser.maxVariables"
                :isRequired="false"
                :isDisabled="!refEdit"
                :type="FieldType.TEXT"
              ></InputField>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
            <div class="col-span-6 md:col-span-2">
              <InputField
                :title="$t('users.maxMacros')"
                v-model="refUser.maxMacros"
                :isRequired="false"
                :isDisabled="!refEdit"
                :type="FieldType.TEXT"
              ></InputField>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div class="sm:col-span-2">
              <Btn v-if="refEdit" :text="$t('save')" :primary="true" class=""></Btn>
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
import Store from './../../store/Store'
import UserModel from './../../Models/UserModel'
import Btn from './../../components/Btn.vue'
import InputField from './../../components/InputField.vue'
import FieldType from './../../Contracts/FieldType'
import { BaseController, ModelCollection } from './../../Classes/BaseController'
import { RouteService } from '../../Classes/RouteService'
import ComfirmPopup from '../../components/ComfirmPopup.vue'
import languages from '../../Contracts/languages'

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/users'
const breadCrumb = ref([{ name: 'Projects', href: '/projects' }])
const { t } = useI18n()
const isOpen = ref(false)

const refUser = ref(new UserModel())
const refUserCollection = ref(new ModelCollection<UserModel>())
const refActivated = ref(false)
const refAdmin = ref(false)
const refEdit = ref(false)

const crudController = new BaseController<UserModel>(
  '/users',
  [{ name: 'photo' }],
  refUser.value,
  store.authUser.token['token']
)

let imageToUpload = crudController.getFileList('photo')

async function init() {
  refUser.value = await crudController.show(Number(route.params.userId))
  refActivated.value = Boolean(refUser.value.isActivated)
  refAdmin.value = Boolean(refUser.value.isAdmin)
  breadCrumb.value = [
    { name: t('users.users'), href: '/users' },
    { name: refUser.value.name, href: '/users/show' + route.params.userId },
  ]
}
async function update() {
  refUser.value.isActivated = Number(refActivated.value)
  refUser.value.isAdmin = Number(refAdmin.value)
  await crudController.update(refUser.value, true)
  refEdit.value = false
  init()
}
function togglerefEdit() {
  refEdit.value = !refEdit.value
  if (refEdit.value == false) {
    init()
  }
}
async function remove() {
  isOpen.value = true
}
async function removeConfirmation() {
  isOpen.value = false
  await crudController.remove(refUser.value.id)
  router.push(routePrefix)
}

init()
</script>
