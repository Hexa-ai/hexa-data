<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from 'vue-i18n'
import { provide, inject } from "vue";
import store from "./store/index";
import axios from "axios"
import Loader from "./components/Loader.vue";
import { useRouter, useRoute } from 'vue-router'
import logo from './assets/logo-hexa-data.svg'
const route = useRoute()
const router = useRouter()
const i18n = useI18n()
provide('store', store)

const publicAppSettingsInitialized = ref(false)
const { t } = useI18n()
let appMenuBgBodyColor: string =''
let appMenuBgOverBodyColor: string =''
let appMenuBgCurrentBodyColor: string =''
let appMenuFontBodyColor: string =''
let appMenuFontOverBodyColor: string =''
let appMenuBgHeaderColor: string =''
let appMenuFontHeaderColor: string =''
let appPrimaryColor: string =''
let appPrimaryOverColor: string =''
let appPrimaryFocusRingColor: string =''

getPublicAppSettings()
checkUserProfile()

async function checkUserProfile() {
  if (localStorage.getItem("authUser") != undefined) {
    store.authUser = JSON.parse(localStorage.getItem("authUser")!)
    i18n.locale.value = store.authUser.lang

  } else {
    router.push('/login')
  }
}
async function getPublicAppSettings() {
  axios.get(window.location.origin + import.meta.env.VITE_API_PREFIX + '/publicAppSettings')
    .then(response => {
      store.publicAppSettings.appCompanyName = response.data.appCompanyName
      store.publicAppSettings.appCompanyAdress = response.data.appCompanyAdress
      store.publicAppSettings.appCompanyPhoneNumber = response.data.appCompanyPhoneNumber
      store.publicAppSettings.appCompanyEmail = response.data.appCompanyEmail

      store.publicAppSettings.appCompanyWebsite = response.data.appCompanyWebsite
      store.publicAppSettings.appDefaultLanguage = response.data.appDefaultLanguage

      store.publicAppSettings.appTitle = response.data.appTitle
      store.publicAppSettings.appVersion = response.data.appVersion
      store.publicAppSettings.appSubTitle1 = response.data.appSubTitle1
      store.publicAppSettings.appSubTitle2 = response.data.appSubTitle2
      store.publicAppSettings.appSubTitle3 = response.data.appSubTitle3
      store.publicAppSettings.appIcon = response.data.appIcon
      store.publicAppSettings.appLoginBackground = response.data.appLoginBackground

      store.publicAppSettings.appMenuBgBodyColor = response.data.appMenuBgBodyColor
      store.publicAppSettings.appMenuBgOverBodyColor = response.data.appMenuBgOverBodyColor
      store.publicAppSettings.appMenuBgCurrentBodyColor = response.data.appMenuBgCurrentBodyColor
      store.publicAppSettings.appMenuFontBodyColor = response.data.appMenuFontBodyColor
      store.publicAppSettings.appMenuFontOverBodyColor = response.data.appMenuFontOverBodyColor
      store.publicAppSettings.appMenuBgHeaderColor = response.data.appMenuBgHeaderColor
      store.publicAppSettings.appMenuFontHeaderColor = response.data.appMenuFontHeaderColor
      store.publicAppSettings.appPrimaryColor = response.data.appPrimaryColor
      store.publicAppSettings.appPrimaryOverColor = response.data.appPrimaryOverColor
      store.publicAppSettings.appPrimaryFocusRingColor = response.data.appPrimaryFocusRingColor
      store.publicAppSettings.isLicenseActivated = response.data.isLicenseActivated
      store.publicAppSettings.isServerInstance = response.data.isServerInstance

      appMenuBgBodyColor = store.publicAppSettings.appMenuBgBodyColor
      appMenuBgOverBodyColor = store.publicAppSettings.appMenuBgOverBodyColor
      appMenuBgCurrentBodyColor = store.publicAppSettings.appMenuBgCurrentBodyColor
      appMenuFontBodyColor = store.publicAppSettings.appMenuFontBodyColor
      appMenuFontOverBodyColor = store.publicAppSettings.appMenuFontOverBodyColor
      appMenuBgHeaderColor = store.publicAppSettings.appMenuBgHeaderColor
      appMenuFontHeaderColor = store.publicAppSettings.appMenuFontHeaderColor
      appPrimaryColor = store.publicAppSettings.appPrimaryColor
      appPrimaryOverColor = store.publicAppSettings.appPrimaryOverColor
      appPrimaryFocusRingColor = store.publicAppSettings.appPrimaryFocusRingColor

      publicAppSettingsInitialized.value = true



      const favicons = document.getElementsByClassName('favicon')
      if (store.publicAppSettings.appIcon!=null){
        favicons[0].setAttribute('href', store.publicAppSettings.appIcon['url'])
        favicons[1].setAttribute('href', store.publicAppSettings.appIcon['url'])
      } else {
        favicons[0].setAttribute('href', logo)
        favicons[1].setAttribute('href', logo)
      }

    })
}

</script>

<template>
  <Loader v-if="publicAppSettingsInitialized == false"></Loader>
  <router-view v-if="publicAppSettingsInitialized == true" :key="route.path"/>
</template>

<style>
.menu-body {
  background-color: v-bind(appMenuBgBodyColor);
}
.menu-body-current-element {
  background-color: v-bind(appMenuBgCurrentBodyColor);
}
.menu-body-element:hover {
  background-color: v-bind(appMenuBgOverBodyColor);
}

.menu-body-font * {
  color: v-bind(appMenuFontBodyColor);
}
.menu-body-font {
  color: v-bind(appMenuFontBodyColor);
}

.menu-body-font:hover * {
  color: v-bind(appMenuFontOverBodyColor);
}
.menu-body-font:hover {
  color: v-bind(appMenuFontOverBodyColor);
}

.menu-header {
  background-color: v-bind(appMenuBgHeaderColor);
}
.menu-header-font {
  color: v-bind(appMenuFontHeaderColor);
}
.primary {
  background-color: v-bind(appPrimaryColor);
}
.primary:hover {
  background-color: v-bind(appPrimaryOverColor);
}
.primary:focus {
  border-color: v-bind(appPrimaryFocusRingColor);
}
</style>
