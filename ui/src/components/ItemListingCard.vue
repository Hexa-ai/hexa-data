<template>
  <div class="card bg-base-100 shadow-md">
    <div class="card-body p-0">
      <div class="flex flex-wrap">
        <div v-for="(item, index) in items" :key="index" class="w-full">
          <div class="flex flex-row items-start p-4 gap-4 hover:bg-gray-100 transition duration-200 ease-in-out"
            :class="{ 'border-t border-surface-200': index !== 0 }" @click="itemClick(item)">
            <slot :item="item"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['itemClick'])

const props = defineProps({
  items: {
    required: true,
  },
})

// Emit click event to parent
const itemClick = (variable) => {
  emit('itemClick', variable)
}
</script>
