<template>
  <div>
    <h3 class="mb-4 text-2xl font-medium text-gray-900">Paramètres globaux du projet</h3>

    <div class="mt-4 grid grid-cols-6 gap-y-6 gap-x-4">
      <label class="col-span-6 lg:col-span-3">
        <span class="label label-text">Identifiant unique</span>
        <input type="text" v-model="project.uuid" class="input input-bordered w-full" disabled />
      </label>
    </div>
    <div class="grid grid-cols-6 gap-y-6 gap-x-4">
      <label class="col-span-6 lg:col-span-3">
        <span class="label label-text">Nom</span>
        <input type="text" v-model="project.name" class="input input-bordered w-full" :disabled="!edit" />
      </label>
    </div>
    <div class="mt-4 grid grid-cols-6 gap-y-6 gap-x-4">
      <label class="col-span-6 lg:col-span-3">
        <span class="label label-text">Description</span>
        <textarea v-model="project.description" :disabled="!edit" class="textarea textarea-bordered w-full"></textarea>
      </label>
    </div>
    <div class="mt-4 grid grid-cols-6 gap-y-6 gap-x-4">
      <label class="col-span-6 lg:col-span-3">
        <span class="label label-text">
          Image
          <span class="text-gray-500 font-normal italic">PNG, JEPG, SVG jusqu'à 5MB</span>
        </span>
        <input type="file" :disabled="!edit" @change="onFilePicked" class="file-input file-input-bordered w-full" />
        <img v-if="photoUrl" class="w-96 mt-2 rounded-lg" :src="photoUrl" />
      </label>
    </div>
    <div class="mt-4 grid grid-cols-6 gap-y-6 gap-x-4">
      <div class="col-span-6 lg:col-span-2">
        <button v-if="edit" @click="save" class="btn btn-warning">Enregistrer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from '@/services/axios'
import bus from '@/services/bus'

const { t } = useI18n()
const props = defineProps(['project', 'edit'])
const emit = defineEmits(['updated'])
const { project, edit }: any = toRefs(props)

/*
 * Image upload management
 */
const photoSource = ref(null)
const photoUrl = ref(null)
const onFilePicked = (event: any) => {
  const files = event.target.files
  if (files && files[0]) {
    photoSource.value = files[0]
    const fileReader = new FileReader()
    fileReader.onload = (e: any) => {
      photoUrl.value = e.target.result
    };
    fileReader.readAsDataURL(files[0])
  }
}

/*
 * Save project
 */
const loading = ref(false)
const save = async () => {
  const formData = new FormData();
  formData.append('name', project.value.name)
  formData.append('description', project.value.description)
  if (photoSource.value) {
    formData.append('photo', photoSource.value)
  }

  try {
    loading.value = true
    await axios.patch(`/projects/${project.value.id}`, formData)
    photoSource.value = null
    photoUrl.value = null
    emit('updated')
    bus.emit('toast')
  } catch (e) {
    bus.emit('toast', { message: t('toast.error') + e, severity: 'error' })
  } finally {
    loading.value = false
  }
}
</script>