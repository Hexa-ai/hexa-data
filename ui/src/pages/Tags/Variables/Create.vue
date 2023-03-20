<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft></template>
      <template v-slot:menuRight class="p-3"></template>
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
                <h3
                  class="text-lg leading-6 font-medium text-gray-900"
                >{{ $t('tags.newVariable') }}</h3>
                <p class="mt-1 text-sm text-gray-500"></p>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.name')"
                    v-model="refTag!.name"
                    :isRequired="true"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.description') + ' (' + store.currentProject.l1 + ')'"
                    v-model="refTag!.descriptionL1"
                    :isRequired="false"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.description') + ' (' + store.currentProject.l2 + ')'"
                    v-model="refTag!.descriptionL2"
                    :isRequired="false"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.description') + ' (' + store.currentProject.l3 + ')'"
                    v-model="refTag!.descriptionL3"
                    :isRequired="false"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.unit')"
                    v-model="refTag!.unit"
                    :isRequired="false"
                    :isDisabled="false"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.device')"
                    v-model="refTag!.deviceId"
                    :isRequired="false"
                    :isDisabled="false"
                    :choices="refDeviceName"
                    :values="refDeviceId"
                    :index-is-value="false"
                    :type="FieldType.SELECT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.valueType')"
                    v-model="refTag!.valueType"
                    :isRequired="false"
                    :isDisabled="false"
                    :choices="['', $t('tags.boolean'), $t('tags.integer'), $t('tags.real'), $t('tags.string')]"
                    :index-is-value="true"
                    :type="FieldType.SELECT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <InputField
                    :title="$t('tags.alarm')"
                    v-model="refTag!.alarm"
                    :isRequired="true"
                    :isDisabled="false"
                    :index-is-value="true"
                    :type="FieldType.CHECKBOX"
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
import { inject, ref } from 'vue';
import BaseLayoutVue from '../../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from './../../../store/Store'
import TagModel from './../../../Models/TagModel';
import Btn from './../../../components/Btn.vue'
import InputField from './../../../components/InputField.vue';
import FieldType from './../../../Contracts/FieldType';
import { BaseController, ModelCollection } from './../../../Classes/BaseController'
import { RouteService } from '../../../Classes/RouteService'
import DeviceModel from '../../../Models/DeviceModel';
import { Utils } from '../../../Classes/Utils';

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const breadCrumb = ref()
const { t } = useI18n()

const refTag = ref(new TagModel())
const refDevice = ref(new DeviceModel())
const refDeviceCollection = ref(new ModelCollection<DeviceModel>())

const refDeviceName =ref<string[]>([])
const refDeviceId =ref<number[]>([])
const edit = ref(false)

let ws = ref("")

const crudController = new BaseController<TagModel>(
  '/tags',
  [],
  refTag.value,
  store.authUser.token['token'],
)

crudController.setRoutePrefix(routePrefix)

const crudDeviceController = new BaseController<DeviceModel>(
  '/devices',
  [],
  refDevice.value,
  store.authUser.token['token'],
)

crudDeviceController.setRoutePrefix(routePrefix)

init()

async function init() {
  await RouteService.getProjectInfos(route)
  refDeviceCollection.value=await crudDeviceController.index(1,100,'')
  refTag.value.type=1
  refDeviceName.value=[]
  refDeviceId.value=[]
  for (const device of refDeviceCollection.value.data) {
    refDeviceName.value.push(device.name)
    refDeviceId.value.push(device.id)
  }
  breadCrumb.value = [{ name: 'Projects', href: '/projects' }, { name: store.currentProject.name, href: routePrefix }, { name: t('navigation.variables'), href: routePrefix + '/variables' }, { name: t('tags.newVariable'), href: routePrefix + '/variables/create' }]
}
async function create() {
  await crudController.store(refTag.value)
  router.push(routePrefix + '/variables')
}

</script>
