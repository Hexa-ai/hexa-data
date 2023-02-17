<template>
    <div>
        <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
            <template v-slot:menuLeft>
            </template>
            <template v-slot:menuRight class="p-3"></template>
            <template v-slot:default>
                <form
                    class="m-3 space-y-8 divide-y divide-gray-200"
                    action="#"
                    method="POST"
                    @submit.prevent="create"
                >
                    <div class="space-y-8 divide-y divide-gray-200">
                        <div>
                            <div>
                                <h3
                                    class="text-lg leading-6 font-medium text-gray-900"
                                >{{ $t('users.profile') }}</h3>
                                <p class="mt-1 text-sm text-gray-500"></p>
                            </div>
                            <div class="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                                <div class="col-span-6 md:col-span-2">
                                    <InputField
                                        :title="$t('users.name')"
                                        v-model="refUser!.name"
                                        :isRequired="false"
                                        :isDisabled="false"
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
                                        :isDisabled="false"
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
                                  :isDisabled="false"
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
                                        :isDisabled="false"
                                        :type="FieldType.PASSWORD"
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
                                        v-model="refUser!.photo"
                                        v-model:fileToUploadValue="imageToUpload"
                                        :isRequired="false"
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
                                        :isRequired="true"
                                        :isDisabled="false"
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
                                        :isDisabled="false"
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
                                        :isDisabled="false"
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
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from '../../store/Store'
import UserModel from '../../Models/UserModel';
import Btn from '../../components/Btn.vue'
import InputField from '../../components/InputField.vue';
import FieldType from '../../Contracts/FieldType';
import { BaseController, ModelCollection } from '../../Classes/BaseController'
import { RouteService } from '../../Classes/RouteService'
import ComfirmPopup from '../../components/ComfirmPopup.vue'
import languages from '../../Contracts/languages';

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
    store.authUser.token['token'],
)


let imageToUpload = crudController.getFileList('photo')

async function init() {
    breadCrumb.value = [{ name: t('users.users'), href: '/users' }, { name: t('users.newUser'), href: '/users/create' }]
}
async function create() {
    refUser.value.isActivated = Number(refActivated.value)
    refUser.value.isAdmin = Number(refAdmin.value)
    await crudController.store(refUser.value)
    router.push('/users')
}

init()
</script>
