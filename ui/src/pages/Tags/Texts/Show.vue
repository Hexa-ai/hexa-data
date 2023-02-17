<template>
  <div>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb">
      <template v-slot:menuLeft></template>
      <template v-slot:menuRight class="p-3">
        <Btn
          v-if="edit == true"
          :text="$t('Supprimer')"
          :primary="true"
          class="m-3"
          @click="remove"
        ></Btn>
        <Btn
          :text="edit == true ? $t('cancel') : $t('edit')"
          :primary="false"
          :action="edit == true ?'cancel':'update'"
          class="m-3"
          @click="toggleEdit"
        ></Btn>
      </template>
      <template v-slot:default>
        <ComfirmPopup
          :title="$t('tags.textDeleteConfirmTitle')"
          :cancel-text="$t('cancel')"
          :confirm-text="$t('remove')"
          :msg="$t('tags.textDeleteConfirmMsg')"
          @comfirm="removeConfirmation"
          v-model="isOpen"
        ></ComfirmPopup>
        <form class="m-3 space-y-8 divide-y divide-gray-200" action="#" method="POST" @submit.prevent="update">
          <div class="space-y-8 divide-y divide-gray-200">
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
                    :isRequired="false"
                    :isDisabled="true"
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
                    :isDisabled="!edit"
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
                    :isDisabled="!edit"
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
                    :isDisabled="!edit"
                    :type="FieldType.TEXT"
                  ></InputField>
                </div>
              </div>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-2">
                  <Btn
                    :text="$t('save')"
                    :primary="true"
                    class=""
                  ></Btn>
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
import WarpChart from './../../../components/WarpChart.vue'
import VarWarpChart from './../../../components/VarWarpChart.vue'
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
import ComfirmPopup from '../../../components/ComfirmPopup.vue'

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!
const routePrefix = '/projects/' + route.params.id
const breadCrumb = ref()
const { t } = useI18n()
const isOpen = ref(false)

const refTag = ref(new TagModel())
const refTagCollection = ref(new ModelCollection<TagModel>())


const edit = ref(false)

const crudController = new BaseController<TagModel>(
  '/tags',
  [],
  refTag.value,
  store.authUser.token['token'],
)

crudController.setRoutePrefix(routePrefix)

init()

async function init() {
  await RouteService.getProjectInfos(route)
  refTag.value = await crudController.show(Number(route.params.tagId))

  breadCrumb.value = [{ name: 'Projects', href: '/projects' }, { name: store.currentProject.name, href: routePrefix }, { name: t('navigation.texts'), href: routePrefix + '/texts' }, { name: refTag.value.name, href: routePrefix + '/texts' + route.params.tagId }]

}
async function update(){
  await crudController.update(refTag.value,true)
  edit.value=false
  init()
}
function toggleEdit() {
  edit.value = !edit.value
  if (edit.value == false) {
    init()
  }
}
async function remove() {
  isOpen.value=true
}
async function removeConfirmation() {
  isOpen.value=false
  await crudController.remove(refTag.value.id)
  router.push(routePrefix + '/texts')
}
</script>
