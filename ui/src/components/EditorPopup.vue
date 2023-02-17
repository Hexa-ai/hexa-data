<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" @close="closeModal">
      <div class="fixed inset-0 z-40 overflow-y-auto">
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
              style="height: 80vh;"
              class="inline-block w-10/12 p-6 my-8 text-left align-middle transition-all transform bg-white border-2 border-gray-200 shadow-xl rounded-2xl"
            >
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">{{ title }}</DialogTitle>
              <button id="bpTest" >Test</button>
              <div class="mt-2">
                <warp-view-editor
                  url="https://warp.senx.io/api/v0/exec"
                  id="wsEditor"
                  theme="dark"
                  height-px="600"
                  horizontalLayout="false"
                  show-dataviz="false"
                  displayMessages="true"
                  :config="config"
                  @click="scriptUpdate"
                >2 2 +</warp-view-editor>
              </div>

              <div class="mt-4 mb-4 flex">
                <div class="flex-grow"></div>
                <Btn :primary="false" :text="cancelText" @click="closeModal"></Btn>

                <Btn class="ml-5" :primary="false" :text="confirmText" @click="confirm"></Btn>
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
import { onUpdated } from "vue";

const store: Store = inject('store')!
const config='{"buttons" : {"class": ""},"execButton" : {"class": " m-3 border-gray-300 text-gray-500 flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white","label": "Executer"},"datavizButton" : {"class": "","label": "Visualize"},"hover" : true,"readOnly" : false,"messageClass" : "","errorClass" : "","editor": {"quickSuggestionsDelay": 10,"quickSuggestions": true,"tabSize": 2,"minLineNumber": 50,"enableDebug": false}}'
const emits = defineEmits(['update:modelValue', 'comfirm'])

const props = defineProps<{
  title: string,
  msg: string,
  cancelText: string,
  confirmText: string,
  modelValue: boolean
}>()

const refWsEditor=ref(null)

onUpdated(() => {
      console.log(refWsEditor.value)
      document.getElementById('wsEditor')!.addEventListener('warpViewEditorWarpscriptChanged', function (e:any) {
        console.log(e.detail)
      });
})
function closeModal() {
  emits('update:modelValue', false)
}
function confirm() {
  emits('comfirm')
}

function init(){
  console.log('Init')

}
function scriptUpdate() {
  console.log('Event')
}
init()
</script>
