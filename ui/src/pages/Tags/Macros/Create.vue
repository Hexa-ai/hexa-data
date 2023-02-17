<template>
  <div id="page" class="h-full">
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
      <template v-slot:menuLeft></template>
      <template v-slot:menuRight class="p-3"></template>
      <template v-slot:default>
        <form
          :style="'min-height: ' + refAppBodyHeight + 'px;'"
          class="divide-gray-200 flex-grow"
          action="#"
          method="POST"
          @submit.prevent="create"
        >
          <div class="m-5 space-y-8 divide-y divide-gray-200">
            <div>
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">{{ $t('tags.parameters') }}</h3>
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
                    :title="$t('tags.type')"
                    v-model="refTag!.type"
                    :isRequired="false"
                    :isDisabled="!edit"
                    :choices="['', $t('tags.variable'), $t('tags.text'), $t('tags.warpScript')]"
                    :index-is-value="true"
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
import EditorPopup from '../../../components/EditorPopup.vue'
import { onUpdated } from "vue";
import InputSwitch from './../../../components/InputSwitch.vue'
import { SunIcon } from '@heroicons/vue/outline'



const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const breadCrumb = ref([{ name: 'Projects', href: '/projects' }])
const { t } = useI18n()

const refEditorSwitch = ref(false)

const refTag = ref(new TagModel())

const crudController = new BaseController<TagModel>(
  '/tags',
  [],
  refTag.value,
  store.authUser.token['token'],
)

crudController.setRoutePrefix(routePrefix)

async function init() {
  await RouteService.getProjectInfos(route)
  refTag.value.type = 3

  breadCrumb.value = [{ name: 'Projects', href: '/projects' }, { name: store.currentProject.name, href: routePrefix }, { name: t('navigation.macros'), href: routePrefix + '/macros' }, { name: t('tags.newMacro'), href: routePrefix + '/macros/create' }]
}
async function create() {
  await crudController.store(refTag.value)
  router.push(routePrefix + '/macros')
}

init()
</script>
