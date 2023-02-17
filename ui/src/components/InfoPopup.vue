<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" @close="closeModal">
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="min-h-screen px-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <DialogOverlay class="fixed inset-0" />
          </TransitionChild>

          <span class="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <div
              class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white border-2 border-gray-200 shadow-xl rounded-2xl"
            >
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">{{ title }}</DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-500">{{ msg }}</p>
              </div>

              <div class="mt-4 flex">
                <div class="flex-grow"></div>
                <Btn  class="ml-5" :primary="false" :text="confirmText" @click="confirm"></Btn>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle } from '@headlessui/vue'
import { emit } from 'process';
import Btn from './Btn.vue';
import Store from '../store/Store'

const store: Store = inject('store')!

const emits = defineEmits(['update:modelValue', 'comfirm'])

const props = defineProps<{
  title: string,
  msg: string,
  cancelText: string,
  confirmText: string,
  modelValue: boolean
}>()

function confirm() {
  emits('comfirm')
}
</script>
