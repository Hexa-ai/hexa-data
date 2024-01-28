<template>
  <BaseLayoutVue :pages-bread-crumb="[{ name: 'Users', href: '/users' }]" :show-tool-bar="true">
    <template v-slot:default>
      <p>Users page</p>
      <p>And another one.</p>
    </template>
  </BaseLayoutVue>
</template>

<script setup lang="ts">
import BaseLayoutVue from '../layouts/BaseLayout.vue'
</script>
