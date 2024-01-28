<template>
  <BaseLayoutVue
    :pages-bread-crumb="[{ name: 'Settings', href: '/settings' }]"
    :show-tool-bar="true"
  >
    <template v-slot:default>
      <form
        v-if="appSettings.id != undefined"
        class="space-y-8 divide-y divide-gray-200 m-5"
        action="#"
        method="POST"
        @submit.prevent="save"
      >
        <div class="space-y-8 divide-y divide-gray-200">
          <div>
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ $t('settingsPage.generalSettings') }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ $t('settingsPage.generalSettingsDescription') }}
              </p>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputField
                  :title="$t('settingsPage.appTitle')"
                  v-model="appSettings!.appTitle"
                  :isRequired="false"
                  :type="FieldType.TEXT"
                ></InputField>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-1">
                <InputField
                  :title="$t('settingsPage.appDefaultLanguage')"
                  v-model="appSettings!.appDefaultLanguage"
                  :isRequired="false"
                  :type="FieldType.SELECT"
                  :index-is-value="false"
                  :values="['fr', 'en']"
                  :choices="['fr', 'en']"
                ></InputField>
              </div>
            </div>
            <div class="mt-10">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ $t('settingsPage.companySettings') }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ $t('settingsPage.companySettingsDescription') }}
              </p>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputField
                  :title="$t('settingsPage.appCompanyName')"
                  v-model="appSettings!.appCompanyName"
                  :isRequired="false"
                  :type="FieldType.TEXT"
                ></InputField>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-3">
                <InputField
                  :title="$t('settingsPage.appCompanyAdress')"
                  v-model="appSettings!.appCompanyAdress"
                  :isRequired="false"
                  :type="FieldType.TEXT"
                ></InputField>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputField
                  :title="$t('settingsPage.appCompanyEmail')"
                  v-model="appSettings!.appCompanyEmail"
                  :isRequired="false"
                  :type="FieldType.EMAIL"
                ></InputField>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputField
                  :title="$t('settingsPage.appCompanyPhoneNumber')"
                  v-model="appSettings!.appCompanyPhoneNumber"
                  :isRequired="false"
                  :type="FieldType.TEXT"
                ></InputField>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputField
                  :title="$t('settingsPage.appCompanyWebsite')"
                  v-model="appSettings!.appCompanyWebsite"
                  :isRequired="false"
                  :type="FieldType.TEXT"
                ></InputField>
              </div>
            </div>
            <div class="mt-10">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ $t('settingsPage.displaySettings') }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ $t('settingsPage.displaySettingsDescription') }}
              </p>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputField
                  :title="$t('settingsPage.appSubTitle1')"
                  v-model="appSettings!.appSubTitle1"
                  :isRequired="false"
                  :type="FieldType.TEXT"
                ></InputField>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputField
                  :title="$t('settingsPage.appSubTitle2')"
                  v-model="appSettings!.appSubTitle2"
                  :isRequired="false"
                  :type="FieldType.TEXT"
                ></InputField>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputField
                  :title="$t('settingsPage.appSubTitle3')"
                  v-model="appSettings!.appSubTitle3"
                  :isRequired="false"
                  :type="FieldType.TEXT"
                ></InputField>
              </div>
            </div>
            >
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputField
                  :title="$t('settingsPage.appIcon')"
                  :upload-text="$t('settingsPage.uploadText')"
                  :drag-and-drop-text="$t('settingsPage.dragAndDropText')"
                  :type-and-size-text="$t('settingsPage.typeAndSizeText')"
                  id="appIcon"
                  v-model="appSettings!.appIcon"
                  v-model:fileToUploadValue="logoToUpload"
                  :isRequired="false"
                  :type="FieldType.FILE"
                ></InputField>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputField
                  :title="$t('settingsPage.appLoginBackground')"
                  :upload-text="$t('settingsPage.uploadText')"
                  :drag-and-drop-text="$t('settingsPage.dragAndDropText')"
                  :type-and-size-text="$t('settingsPage.typeAndSizeText')"
                  id="appLoginBackground"
                  file-field-name="appLoginBackground"
                  v-model="appSettings!.appLoginBackground"
                  v-model:fileToUploadValue="backgroundToUpload"
                  :isRequired="false"
                  :type="FieldType.FILE"
                >
                </InputField>
              </div>
            </div>
            <div class="mt-10">
              <h3 class="text-base italic leading-6 font-medium text-gray-900">
                {{ $t('settingsPage.menuSettings') }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ $t('settingsPage.menuSettingsDescription') }}
              </p>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputFieldColorPicker
                  :title="$t('settingsPage.appMenuBgBodyColor')"
                  v-model="appSettings!.appMenuBgBodyColor"
                ></InputFieldColorPicker>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputFieldColorPicker
                  :title="$t('settingsPage.appMenuBgOverBodyColor')"
                  v-model="appSettings!.appMenuBgOverBodyColor"
                ></InputFieldColorPicker>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputFieldColorPicker
                  :title="$t('settingsPage.appMenuBgCurrentBodyColor')"
                  v-model="appSettings!.appMenuBgCurrentBodyColor"
                ></InputFieldColorPicker>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputFieldColorPicker
                  :title="$t('settingsPage.appMenuFontBodyColor')"
                  v-model="appSettings!.appMenuFontBodyColor"
                ></InputFieldColorPicker>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputFieldColorPicker
                  :title="$t('settingsPage.appMenuFontOverBodyColor')"
                  v-model="appSettings!.appMenuFontOverBodyColor"
                ></InputFieldColorPicker>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputFieldColorPicker
                  :title="$t('settingsPage.appMenuBgHeaderColor')"
                  v-model="appSettings!.appMenuBgHeaderColor"
                ></InputFieldColorPicker>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputFieldColorPicker
                  :title="$t('settingsPage.appMenuFontHeaderColor')"
                  v-model="appSettings!.appMenuFontHeaderColor"
                ></InputFieldColorPicker>
              </div>
            </div>
            <div>
              <h3 class="text-base italic leading-6 font-medium text-gray-900">
                {{ $t('settingsPage.primaryBtnSettings') }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ $t('settingsPage.primaryBtnSettingsDescription') }}
              </p>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputFieldColorPicker
                  :title="$t('settingsPage.appPrimaryColor')"
                  v-model="appSettings!.appPrimaryColor"
                ></InputFieldColorPicker>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputFieldColorPicker
                  :title="$t('settingsPage.appPrimaryOverColor')"
                  v-model="appSettings!.appPrimaryOverColor"
                ></InputFieldColorPicker>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <InputFieldColorPicker
                  :title="$t('settingsPage.appPrimaryFocusRingColor')"
                  v-model="appSettings!.appPrimaryFocusRingColor"
                ></InputFieldColorPicker>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <Btn :text="$t('settingsPage.save')" :primary="true"></Btn>
              </div>
            </div>
            <div class="mt-5 pt-5 sm:border-t sm:border-gray-200">
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ $t('settingsPage.libHdWsMacroTitle') }}
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  {{ $t('settingsPage.libHdWsMacroDescription') }}
                </p>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputFieldDate
                    :title="$t('settingsPage.libHdWsMacroLastUpdate')"
                    :range="false"
                    v-model="appSettings!.hdWsMacroLastUpdate"
                    :isRequired="false"
                    :isDisabled="true"
                    class="mb-3"
                  ></InputFieldDate>
                </div>
                <div class="sm:col-span-1 pt-5">
                  <Btn
                    :text="$t('settingsPage.libHdWsMacroUpdate')"
                    :primary="false"
                    v-on:click="updateHdWsMacro"
                  ></Btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </template>
  </BaseLayoutVue>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import Btn from '../../components/Btn.vue'
import InputField from '../../components/InputField.vue'
import InputFieldColorPicker from '../../components/InputFieldColorPicker.vue'
import InputFieldDate from '../../components/InputFieldDate.vue'
import FieldType from '../../Contracts/FieldType'
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from '../../store/Store'
import AppSettings from '../../Models/AppSettings'
import { BaseController } from '../../Classes/BaseController'

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!

const appSettings = ref<AppSettings>(new AppSettings())

const crudController = new BaseController<AppSettings>(
  '/allAppSettings',
  [{ name: 'appIcon' }, { name: 'appLoginBackground' }],
  appSettings.value,
  store.authUser.token['token']
)

let backgroundToUpload = crudController.getFileList('appLoginBackground')
let logoToUpload = crudController.getFileList('appIcon')

init()

async function init() {
  appSettings.value = await crudController.show()
  console.log(appSettings.value)
}

async function save() {
  await crudController.update(appSettings.value, false)
  router.go(0)
}

async function updateHdWsMacro() {
  await crudController.post('updateHdWsMacro')
  init()
}
</script>
