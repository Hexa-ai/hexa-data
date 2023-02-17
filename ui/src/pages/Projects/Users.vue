<template>
    <BaseLayoutVue :pages-bread-crumb="breadCrumb" :show-tool-bar="true">
        <template v-slot:menuLeft>
            <form class="flex flex-wrap m-3" action="#" method="POST" @submit.prevent="invite">
                <input
                    v-if="store.authUser.isAdmin==1 || store.currentProject.owner.id==store.authUser.id"
                    class="mr-3 peer block disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    type="email"
                    v-model="refEmail"
                    placeholder="email@domain.com"
                />
                <Btn
                    v-if="store.authUser.isAdmin==1 || store.currentProject.owner.id==store.authUser.id"
                    :text="$t('users.invitation')" :action="'addUser'" :primary="false" class=""></Btn>
            </form>
        </template>
        <template v-slot:menuRight class=""></template>
        <template v-slot:default>
            <InfoPopup
                :title="$t('users.noAccountTitle')"
                :confirm-text="$t('close')"
                :msg="$t('users.noAccountMsg')"
                @comfirm="closePopup"
                v-model="isOpen"
            ></InfoPopup>
            <div class="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" class="divide-y divide-gray-200">
                    <li v-for="user in refUserCollection.data" :key="user.id">
                        <router-link :to="routePrefix + '/' + route.params.id +'/users/' + user.id" class="block hover:bg-gray-50">
                            <div class="flex items-center px-4 py-4 sm:px-6">
                                <div class="min-w-0 flex-1 flex items-center">
                                    <div class="flex-shrink-0">
                                        <img
                                            v-if="user.photo != null"
                                            class="h-12 w-12 rounded-full"
                                            :src="user.photo.url"
                                        />
                                        <img
                                            v-if="user.photo == null"
                                            class="h-12 w-12 rounded-full user-picture"
                                        />
                                    </div>
                                    <div
                                        class="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4"
                                    >
                                        <div>
                                            <div class="flex flex-wrap">
                                            <p
                                                class="text-sm font-medium text-indigo-600 truncate"
                                            >{{ user.name }}</p>
                                            <p
                                                v-if="user.meta.pivot_role==Role.USER"
                                                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                                            >{{ t('users.userRole') }}</p>
                                            <p
                                                v-if="user.meta.pivot_role==Role.EDITOR"
                                                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                                            >{{ t('users.editorRole') }}</p>
                                            </div>
                                            <p class="mt-2 flex items-center text-sm text-gray-500">
                                                <MailIcon
                                                    class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                                    aria-hidden="true"
                                                />
                                                <span class="truncate">{{ user.email }}</span>
                                            </p>
                                        </div>
                                        <div class="hidden md:block">
                                            <div>
                                                <p class="text-sm text-gray-900">
                                                    {{ $t('users.createdOn') }}
                                                    {{ ' ' }}
                                                    <time
                                                        :datetime="''"
                                                    >{{ new Date(Date.parse(user.createdAt)).toLocaleDateString() }}</time>
                                                </p>
                                                <p
                                                    v-if="user.isActivated == 1"
                                                    class="mt-2 flex items-center text-sm text-gray-500"
                                                >
                                                    <CheckCircleIcon
                                                        class="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400"
                                                        aria-hidden="true"
                                                    />
                                                    {{ $t('users.activated') }}
                                                </p>
                                                <p
                                                    v-if="user.isActivated == 0"
                                                    class="mt-2 flex items-center text-sm text-gray-500"
                                                >
                                                    <ExclamationCircleIcon
                                                        class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                                        aria-hidden="true"
                                                    />
                                                    {{ $t('users.pendingActivation') }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <ChevronRightIcon
                                        class="h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                </div>
                            </div>
                        </router-link>
                    </li>
                </ul>
            </div>
            <Pagination :pagination="refUserCollection.pagination" class="mt-5"></Pagination>
        </template>
    </BaseLayoutVue>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import Btn from '../../components/Btn.vue';
import InputField from '../../components/InputField.vue'
import InputFieldColorPicker from '../../components/InputFieldColorPicker.vue';
import FieldType from '../../Contracts/FieldType'
import Pagination from '../../components/Pagination.vue';
import BaseLayoutVue from '../../layouts/BaseLayout.vue';
import { useRouter, useRoute } from 'vue-router'
import Store from '../../store/Store'
import UserModel from '../../Models/UserModel';
import { BaseController, ModelCollection } from '../../Classes/BaseController'
import { ExclamationCircleIcon, CheckCircleIcon, ChevronRightIcon, MailIcon, UserAddIcon } from '@heroicons/vue/outline'
import SearchNav from '../../components/SearchNav.vue';
import { RouteService } from '../../Classes/RouteService'
import ProjectInfoModel from '../../Models/ProjectInfoModel'
import axios from "axios"
import InfoPopup from '../../components/InfoPopup.vue'
import { useI18n } from 'vue-i18n';
import Role from '../../Classes/Roles'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const routePrefix = '/projects'
const store: Store = inject('store')!
const breadCrumb = ref([{ name: 'Projects', href: '/projects' }])

const refProjectInfo = ref(new ProjectInfoModel())
const refUserCollection = ref(new ModelCollection<UserModel>())
const refEmail = ref('')
const isOpen = ref(false)

let createdAt = computed((date) => new Date(date))





async function init() {
    refProjectInfo.value = await RouteService.getProjectInfos(route)
    breadCrumb.value = [{ name: 'Projects', href: '/projects' }, { name: store.currentProject.name, href: routePrefix + '/' + route.params.id }, { name: t('navigation.users'), href: routePrefix + '/' + route.params.id + '/users' }]

    refUserCollection.value.data = refProjectInfo.value.users
}

async function invite() {
    if (refEmail.value!=''){
        axios.post(import.meta.env.VITE_API_PREFIX + '/projects/' + route.params.id + '/invitation', { email: refEmail.value }, { headers: { Authorization: `Bearer ${store.authUser.token.token}` } })
            .then(response => {
                refEmail.value=''
                init()
            })
            .catch(error => {
                isOpen.value=true
            })
    }

}
async function closePopup() {
    isOpen.value = false
    init()
}

init()
</script>

<style>
.user-picture {
    background-color: #dfdbe5;
    background-image: url("data:image/svg+xml,%3Csvg width='16' height='20' viewBox='0 0 16 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M8 0v20L0 10M16 0v10L8 0M16 10v10H8'/%3E%3C/g%3E%3C/svg%3E");
}
</style>
