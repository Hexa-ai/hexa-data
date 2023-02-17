<template>
  <div class="col-span-6 sm:col-span-4">
    <div class="col-span-6 sm:col-span-4">
      <div v-if="type == FieldType.CHECKBOX" class="relative flex items-start">
        <div class="flex items-center h-5">
          <input
            class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            type="checkbox"
            v-model="modelValue"
            v-on:input="check"
            :disabled="isDisabled == true"
          />
        </div>
        <div class="ml-3 text-sm">
          <label for="comments" class="font-medium text-gray-700">{{ title }}</label>
          <p
            class="text-gray-500"
          >{{ comment }}</p>
        </div>
      </div>
      <div v-if="type != FieldType.CHECKBOX" class="flex justify-between">
        <label for="email" class="block text-sm font-medium text-gray-700">{{ title }}</label>
        <span v-if="isRequired" class="text-sm text-gray-500">*</span>
      </div>
      <div class="mt-1 relative rounded-md" @dragover.prevent @drop.prevent>
        <Datepicker
          v-if="type == FieldType.DATE_TIME"
          :local="local"
          format="dd/MM/yyyy HH:mm:ss"
          :cancelText="cancelText"
          :selectText="selectText"
          :required="isRequired"
          inputClassName="peer block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          v-model="modelValue"
          v-on:update:modelValue="emitDateTime"
          :disabled="isDisabled == true"
          enableSeconds
        ></Datepicker>
        <input
          v-if="type == FieldType.PASSWORD"
          :required="isRequired"
          class="peer block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          type="password"
          :value="modelValue"
          v-on:input="validate"
          :disabled="isDisabled == true"
        />
        <input
          v-if="type == FieldType.TEXT"
          :required="isRequired"
          class="peer block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          type="text"
          :value="modelValue"
          v-on:input="validate"
          :disabled="isDisabled == true"
        />
        <input
          v-if="type == FieldType.EMAIL"
          :required="isRequired"
          class="peer block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          type="email"
          placeholder="email@domain.com"
          :value="modelValue"
          v-on:input="validate"
          :disabled="isDisabled == true"
        />
        <input
          v-if="type == FieldType.NUMBER"
          :required="isRequired"
          class="peer block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          type="text"
          placeholder="0600000000"
          :value="modelValue"
          v-on:input="validate"
          :disabled="isDisabled == true"
        />

        <textarea
          v-if="type == FieldType.PARAGRAPH"
          v-bind:rows="rows"
          :required="isRequired"
          class="peer block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          :value="modelValue.toString()"
          v-on:input="validate"
          :disabled="isDisabled == true"
        ></textarea>

        <select
          v-if="type == FieldType.SELECT && indexIsValue == true"
          :required="isRequired"
          class="peer w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          v-bind:value="modelValue"
          v-on:input="validate"
          :disabled="isDisabled == true"
        >
          <option v-for="(choice, index) in choices" v-bind:key="index" :value="index">{{ choice }}</option>
        </select>
        <select
          v-if="type == FieldType.SELECT && indexIsValue == false"
          :required="isRequired"
          class="peer w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          v-bind:value="modelValue"
          v-on:input="validate"
          :disabled="isDisabled == true"
        >
          <option v-for="(choice, index) in choices" v-bind:key="index" :value="values![index]">{{ choice }}</option>
        </select>
        <div
          v-if="type == FieldType.FILE"
          class="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
          v-on:drop="dragFile"
        >
          <div class="space-y-1 text-center">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div class="flex text-sm text-gray-600">
              <label
                :for="id"
                class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <span>{{uploadText}}</span>
                <input
                  :id="id"
                  :name="id"
                  type="file"
                  @change="uploadFile"
                  class="sr-only h-20 w-20"
                  :disabled="isDisabled == true"
                />
              </label>
              <p class="pl-1">{{dragAndDropText}}</p>
            </div>
            <p class="text-xs text-gray-500">{{typeAndSizeText}}</p>
          </div>
        </div>
        <div
          v-if="modelValue != ''"
          class="invisible peer-invalid:visible peer-placeholder-shown:invisible absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
        >
          <ExclamationCircleIcon class="h-5 w-5 text-gray-500" />
        </div>
      </div>
      <p class="mt-2 text-sm text-red-600" v-if="errorMsg != ''">{{ errorMsg }}</p>
    </div>
    <div v-if="confirm == true" class="col-span-6 sm:col-span-4 mt-6">
      <div class="flex justify-between">
        <label for="email" class="block text-sm font-medium text-gray-700">{{ confirmTitle }}</label>
        <span v-if="isRequired" class="text-sm text-gray-500">*</span>
      </div>
      <div class="mt-1 relative rounded-md shadow-sm">
        <input
          v-if="type == FieldType.DATE_TIME"
          :required="isRequired"
          class="block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          type="text"
          v-on:input="validateConfirm"
          :disabled="isDisabled == true"
        />
        <input
          v-if="type == FieldType.PASSWORD"
          :required="isRequired"
          class="block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          type="password"
          v-on:input="validateConfirm"
          :disabled="isDisabled == true"
        />
        <input
          v-if="type == FieldType.TEXT"
          :required="isRequired"
          class="peer block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          type="text"
          :value="modelValue"
          v-on:input="validate"
          :disabled="isDisabled == true"
        />
        <input
          v-if="type == FieldType.EMAIL"
          :required="isRequired"
          class="peer block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          type="email"
          placeholder="email@domain.com"
          :value="modelValue"
          v-on:input="validate"
          :disabled="isDisabled == true"
        />

        <textarea
          v-if="type == FieldType.PARAGRAPH"
          v-bind:rows="rows"
          :required="isRequired"
          class="block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          v-on:input="validateConfirm"
          :disabled="isDisabled == true"
        ></textarea>

        <select
          v-if="type == FieldType.SELECT && indexIsValue == true"
          :required="isRequired"
          class="block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          v-on:input="validateConfirm"
          :disabled="isDisabled == true"
        >
          <option v-for="(choice, index) in choices" v-bind:key="index" :value="index">{{ choice }}</option>
        </select>
        <select
          v-if="type == FieldType.SELECT && indexIsValue == false"
          :required="isRequired"
          class="block w-full pr-10 disabled:opacity-75 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          v-on:input="validateConfirm"
          :disabled="isDisabled == true"
        >
          <option v-for="(choice, index) in choices" v-bind:key="values![index]" :value="values![index]">{{ choice }}</option>
        </select>
        <div
          v-if="modelValue != ''"
          class="invisible peer-invalid:visible peer-placeholder-shown:invisible absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
        >
          <ExclamationCircleIcon class="h-5 w-5 text-gray-500" />
        </div>
      </div>
      <p class="mt-2 text-sm text-red-600" v-if="errorMsg != ''">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ExclamationCircleIcon } from '@heroicons/vue/solid'
import FieldType from '../Contracts/FieldType'
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const emits = defineEmits(['update:modelValue', 'update:confirmed', 'update:fileToUploadValue'])

const props = defineProps<{
  title: string,
  uploadText?:string,
  dragAndDropText?:string,
  typeAndSizeText?:string,
  id?:string,
  comment?:string,
  confirmTitle?: string,
  type: FieldType,
  modelValue: any,
  fileToUploadValue?: FileList,
  isRequired?: boolean,
  isDisabled?: boolean,
  confirmed?: boolean,
  rows?: string,
  choices?: string[],
  values?: number[] | string[],
  indexIsValue?: boolean,
  confirm?: boolean,
  confirmError?: string,
  backendError?: string
  local?: string
  selectText?: string
  cancelText?: string
}>()
let errorMsg = ref('')

let inputValue: string
let inputConfirmValue: string

/**
 * check initial field
 *
 * @param e Event
 */
function check(e: Event) {
  const target = e.target as HTMLInputElement
  emits('update:modelValue', target.checked)
}

/**
 * Validate initial field
 *
 * @param e Event
 */
function validate(e: Event) {
  const target = e.target as HTMLInputElement
  inputValue = target.value


  if (props.confirm == true) {
    if (target.value == inputConfirmValue) {
      errorMsg.value = ''
      emits('update:confirmed', true)
    } else {
      emits('update:confirmed', false)
      if (props.confirmError != undefined) {
        errorMsg.value = props.confirmError
      } else {
        errorMsg.value = 'field confirmation error'
      }
    }
  } else {
    errorMsg.value = ''
  }

  emits('update:modelValue', target.value)
}

/**
 * Validate confirmation field
 *
 * @param e Event
 */
function validateConfirm(e: Event) {
  const target = e.target as HTMLInputElement
  inputConfirmValue = target.value

  if (target.value == inputValue) {
    errorMsg.value = ''
    emits('update:confirmed', true)
  } else {
    emits('update:confirmed', false)
    if (props.confirmError != undefined) {
      errorMsg.value = props.confirmError
    } else {
      errorMsg.value = 'field confirmation error'
    }
  }
}
function dragFile(e: any) {
  emits('update:fileToUploadValue', e.dataTransfer.files)
}
function uploadFile(e: Event) {
  const target = e.target as HTMLInputElement
  emits('update:fileToUploadValue', target.files)
}

function emitDateTime(e:Event) {
  const event = new Date( String(e));
  emits('update:modelValue', event.toISOString())
}
</script>
