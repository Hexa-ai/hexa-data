<template>
  <div  class="loader"><div v-show="isLoading" class="spinner"></div></div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const isLoading = ref(false)

  const originalOpen = XMLHttpRequest.prototype.open
    const self = this

  XMLHttpRequest.prototype.open = function (method, url) {
    const args: [string, string | URL, boolean, string | null | undefined, string | null | undefined] = [
    method,
    url
  ];
    isLoading.value = true
    this.addEventListener('readystatechange', function () {
      if (this.readyState === 4) {
        isLoading.value = false
      }
    })
    originalOpen.apply(this, args)
  }
</script>
<style>
.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.spinner {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 4px solid #ccc;
  border-top-color: #333;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
