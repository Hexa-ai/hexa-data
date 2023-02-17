<template>
  <div class="h-full flex">
    <div
      class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24"
    >
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <img
            v-if="store.publicAppSettings.appIcon"
            class="h-28 w-auto"
            :src="store.publicAppSettings.appIcon.url"
            alt="AppLogo"
          />
          <img
            v-if="!store.publicAppSettings.appIcon"
            class="h-28 w-auto"
            src="./../assets/logo-hexa-data.svg"
            alt="AppLogo"
          />
          <h2
            class="mt-6 text-3xl font-extrabold text-gray-900"
          >{{ store.publicAppSettings.appTitle }}</h2>
          <p class="mt-2 text-sm text-gray-600">
            <VueWriter :array="subTitles" :typeSpeed="20" :eraseSpeed="20" />
          </p>
        </div>

        <div class="mt-8">
          <div class="mt-6">
            <form action="#" method="POST" class="space-y-6" @submit.prevent="login">
              <InputField
                :title="$t('loginPage.emailAdress')"
                v-model="formLogin.email"
                :isRequired="true"
                :type="FieldType.EMAIL"
              ></InputField>
              <InputField
                :title="$t('loginPage.password')"
                v-model="formLogin.password"
                :isRequired="true"
                :type="FieldType.PASSWORD"
              ></InputField>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <InputField
                    :title="$t('loginPage.RemenberMe')"
                    v-model="rememberMe"
                    :isRequired="false"
                    :type="FieldType.CHECKBOX"
                  ></InputField>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <label
                  v-if="invalidCredential == true"
                  for="remember-me"
                  class="ml-2 block italic text-sm text-red-900"
                >{{ $t("loginPage.invalidCredential") }}</label>
              </div>
              <div>
                <Btn :text="$t('loginPage.login')" :primary="true" class="w-full"></Btn>

                <AlertCard
                  v-if="invalidCredential == true"
                  :title="$t('loginPage.invalidCredential')"
                  :msg="$t('loginPage.invalidCredentialMsg')"
                ></AlertCard>
              </div>
              <div class="mt-6 relative">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                  <div class="w-full border-t border-gray-300" />
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">{{ $t("loginPage.resetPasswordTitle") }}</span>
                </div>
              </div>
              <div>
                <router-link
                  to="/forgot-password"
                  class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >{{ $t("loginPage.forgotPassword") }}</router-link>
              </div>
              <div class="mt-6 relative">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                  <div class="w-full border-t border-gray-300" />
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">{{ $t("loginPage.signUpTitle") }}</span>
                </div>
              </div>
              <div>
                <router-link
                  to="/register"
                  class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >{{ $t("loginPage.signUp") }}</router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="hidden lg:block relative w-0 flex-1">
      <img
        v-if="store.publicAppSettings.appLoginBackground"
        class="absolute inset-0 h-full w-full object-cover"
        :src="store.publicAppSettings.appLoginBackground.url"
        alt="AppLogo"
      />
      <img
        v-if="!store.publicAppSettings.appLoginBackground"
        class="absolute inset-0 h-full w-full object-cover"
        src="./../assets/bg-hexa-data.svg"
        alt="AppLogo"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, inject } from 'vue'
import { onMounted } from "@vue/runtime-core";
import AlertCard from './../components/AlertCard.vue'
import axios from "axios"
import { useRouter } from 'vue-router'
import Store from '../store/Store';
import FieldType from './../Contracts/FieldType'
import Btn from '../components/Btn.vue';
import InputField from './../components/InputField.vue'
import { useI18n } from 'vue-i18n';
const router = useRouter()
const i18n = useI18n()

interface I_loginInfos {
  email: string,
  password: string;
}

const store: Store = inject('store')!


const subTitles = ref([store.publicAppSettings.appSubTitle1, store.publicAppSettings.appSubTitle2, store.publicAppSettings.appSubTitle3])
let formLogin = ref<I_loginInfos>({ email: '', password: '' })
let invalidCredential = ref(false)
let rememberMe = ref(false)

if (localStorage.getItem("rememberMe") == 'true') {
  rememberMe.value = true
  formLogin.value.email = localStorage.getItem("email")!
}

checkUserProfile()

async function checkUserProfile() {
  if (localStorage.getItem("authUser")!=undefined) {
    router.push('/projects')
  }
}

async function login() {
  axios.post(window.location.origin + import.meta.env.VITE_API_PREFIX + '/login', formLogin.value)
    .then(response => {
      invalidCredential.value = false

      store.authUser.email = response.data.email
      store.authUser.id = response.data.id
      store.authUser.isActivated = response.data.isActivated
      store.authUser.isAdmin = response.data.isAdmin
      store.authUser.lang = response.data.lang
      store.authUser.meta = response.data.meta
      store.authUser.name = response.data.name
      store.authUser.photo = response.data.photo
      store.authUser.rememberMeToken = response.data.rememberMeToken
      store.authUser.token = response.data.token
      store.authUser.maxDevices = response.data.maxDevices
      store.authUser.maxMacros = response.data.maxMacros
      store.authUser.maxProjects = response.data.maxProjects
      store.authUser.maxVariables = response.data.maxVariables

      i18n.locale.value = store.authUser.lang

      if (rememberMe.value == true) {
        store.authUser.rememberMeToken = true
        localStorage.setItem("rememberMe", "true")
        localStorage.setItem("email", response.data.email)
      } else {
        store.authUser.rememberMeToken = false
        localStorage.removeItem("rememberMe")
        localStorage.removeItem("email")
      }

      localStorage.setItem("authUser", JSON.stringify(store.authUser));
      router.push('/projects')
    })
    .catch(error => {
      invalidCredential.value = true
    })
}
</script>
