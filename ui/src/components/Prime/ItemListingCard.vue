<template>
  <Card :pt="{ body: { class: 'p-0' }, content: { class: 'p-0' } }">
    <template #content>
      <DataView :value="items">
        <template #list="slotProps">
          <div class="flex flex-wrap">
            <div v-for="(item, index) in slotProps.items" :key="index" class="w-full">
              <div
                class="flex flex-row items-start p-4 gap-4 cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out"
                :class="{ 'border-t border-surface-200': index !== 0 }"
                @click="itemClick(item)"
              >
                <slot :item="item"></slot>
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </template>
  </Card>
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
