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
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            {{ store.publicAppSettings.appTitle }}
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            {{ $t("forgotPasswordPage.infos") }}
          </p>
        </div>

        <div class="mt-8">
          <div class="mt-6">
            <form action="#" method="POST" class="space-y-6" @submit.prevent="newPassword">
              <InputField
                :title="$t('registerPage.emailAdress')"
                v-model="formData.email"
                :isRequired="true"
                :type="FieldType.EMAIL"
              ></InputField>
              <Btn :text="$t('forgotPasswordPage.resetPassword')" :primary="true" class="w-full"></Btn>
              <div class="mt-6 relative">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                  <div class="w-full border-t border-gray-300" />
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">{{
                    $t('registerPage.signInTitle')
                  }}</span>
                </div>
              </div>
              <div>
                <router-link
                  to="/login"
                  class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >{{ $t('registerPage.singnIn') }}</router-link
                >
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
import Btn from '../components/Btn.vue'
import InputField from './../components/InputField.vue'
import FieldType from './../Contracts/FieldType'
import { ref, inject, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
const router = useRouter()

const store: any = inject('store')
let formData = ref<{
  email: string
}>({ email: ''})

async function newPassword() {
  console.log('Password forgotten')
  axios
    .post(
      window.location.origin +
        import.meta.env.VITE_API_PREFIX +
        '/forgot-password', formData.value
    )
    .then((response) => {
      console.log(response.data)
      router.push('/login')
    })
    .catch((error) => {
      console.log(error)
    })
}
</script>
