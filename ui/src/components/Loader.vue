<template>
  <div class="flex items-center justify-center h-screen">
    <div class="flex flex-col items-center justify-center">
      <div  style="border-top-color:transparent" class="w-16 h-16 border-8 border-indigo-600 border-solid rounded-full animate-spin " role="status"></div>
      <p class="mt-2">{{ $t("loader.msg") }}</p>
    </div>
  </div>
</template>
