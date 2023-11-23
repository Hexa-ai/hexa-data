<template>
  <BaseLayoutVue
    :pages-bread-crumb="[{ name: $t('users.users'), href: '/users' }]"
    :show-tool-bar="true"
  >
    <template v-slot:menuLeft>
      <SearchNav class="h-full" v-model="refSearch"></SearchNav>
    </template>
    <template v-slot:menuRight class="p-3">
      <Btn
        :text="$t('users.newUser')"
        :primary="false"
        :action="'create'"
        class="m-3"
        @click="create"
      ></Btn>
    </template>
    <template v-slot:default>
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" class="divide-y divide-gray-200">
          <li v-for="user in refUserCollection.data" :key="user.id">
            <router-link :to="'/users/' + user.id" class="block hover:bg-gray-50">
              <div class="flex items-center px-4 py-4 sm:px-6">
                <div class="min-w-0 flex-1 flex items-center">
                  <div class="flex-shrink-0">
                    <img
                      v-if="user.photo != null"
                      class="h-12 w-12 rounded-full"
                      :src="user.photo.url"
                    />
                    <img v-if="user.photo == null" class="h-12 w-12 rounded-full user-picture" />
                  </div>
                  <div class="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                    <div>
                      <div class="flex flex-wrap">
                        <p class="text-sm font-medium text-indigo-600 truncate">{{ user.name }}</p>
                        <p
                          v-if="user.isAdmin == 1"
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                        >
                          {{ $t('users.admin') }}
                        </p>
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
                          <time :datetime="''">{{
                            new Date(Date.parse(user.createdAt)).toLocaleDateString()
                          }}</time>
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
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
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
import { computed, inject, ref, watch } from 'vue'
import Btn from '../../components/Btn.vue'
import InputField from '../../components/InputField.vue'
import InputFieldColorPicker from '../../components/InputFieldColorPicker.vue'
import FieldType from '../../Contracts/FieldType'
import Pagination from '../../components/Pagination.vue'
import BaseLayoutVue from '../../layouts/BaseLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import Store from '../../store/Store'
import UserModel from '../../Models/UserModel'
import { BaseController, ModelCollection } from '../../Classes/BaseController'
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  MailIcon,
} from '@heroicons/vue/outline'
import SearchNav from '../../components/SearchNav.vue'

const router = useRouter()
const route = useRoute()
const store: Store = inject('store')!

const refSearch = ref('')
const refUser = ref(new UserModel())
const refUserCollection = ref(new ModelCollection<UserModel>())

const crudController = new BaseController<UserModel>(
  '/users',
  [{ name: 'photo' }],
  refUser.value,
  store.authUser.token['token']
)

let createdAt = computed((date) => new Date(date))

let photo = crudController.getFileList('photo')

async function init() {
  const page = route.query['page'] ? Number(route.query['page']) : 1
  refUserCollection.value = await crudController.index(page, 100, refSearch.value)
}
async function create() {
  router.push('/users/create')
}
watch(
  () => route.query['page'],
  () => {
    init()
  }
)
watch(
  () => refSearch.value,
  () => {
    init()
  }
)

init()
</script>

<style>
.user-picture {
  background-color: #dfdbe5;
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='20' viewBox='0 0 16 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M8 0v20L0 10M16 0v10L8 0M16 10v10H8'/%3E%3C/g%3E%3C/svg%3E");
}
</style>
