<template>
  <h3 class="mb-4 text-2xl font-medium text-gray-900">Jetons long terme</h3>

  <div v-if="edit">
    <div class="grid grid-cols-6 gap-y-6 gap-x-4">
      <label class="col-span-6 lg:col-span-3">
        <span class="label label-text">Durée de validité des tokens</span>
        <select :disabled="!edit" class="select select-bordered w-full mr-4" v-model="duration">
          <option value="2628000">1 mois</option>
          <option value="7884000">3 mois</option>
          <option value="15768000">6 mois</option>
          <option v-for="year in 10" :key="year" :value="year * 31536000">
            {{ year }} ans
          </option>
        </select>
      </label>
    </div>
    <div class="mt-4 grid grid-cols-6 gap-y-6 gap-x-4">
      <div class="col-span-6 md:col-span-2">
        <button v-if="edit && !project.persistentTokenIssuance" @click="generate" class="btn btn-warning">Générer des
          tokens persistants</button>
        <button v-if="edit && project.persistentTokenIssuance" @click="generate" class="btn btn-error">Regénérer les
          tokens persistants</button>
      </div>
    </div>
    <div class="divider"></div>
  </div>
  <div>
    <div class="grid grid-cols-6 gap-y-6 gap-x-4">
      <label class="col-span-6 lg:col-span-3">
        <span class="label label-text">Jeton de lecture</span>
        <textarea rows="4" v-model="project.persistentReadToken" disabled
          class="textarea textarea-bordered w-full"></textarea>
      </label>
    </div>
    <div class="mt-4 grid grid-cols-6 gap-y-6 gap-x-4">
      <label class="col-span-6 lg:col-span-3">
        <span class="label label-text">Jeton d'écriture</span>
        <textarea rows="4" v-model="project.persistentWriteToken" disabled
          class="textarea textarea-bordered w-full"></textarea>
      </label>
    </div>
    <div class="mt-4 grid grid-cols-6 gap-y-6 gap-x-4">
      <label class="col-span-6 lg:col-span-3">
        <span class="label label-text">Date de délivrance des jetons</span>
        <input type="text" v-model="project.persistentTokenIssuance" class="input input-bordered w-full" disabled />
      </label>
    </div>
    <div class="mt-4 grid grid-cols-6 gap-y-6 gap-x-4">
      <label class="col-span-6 lg:col-span-3">
        <span class="label label-text">Date d'expiration des jetons</span>
        <input type="text" v-model="project.persistentTokenExpiry" class="input input-bordered w-full" disabled />
      </label>
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

const duration = ref(31536000)

/*
 * Generate tokens
 */
const loading = ref(false)
const generate = async () => {
  try {
    loading.value = true
    await axios.post('/projects/' + project.value.id + '/generatePersistentTokens', {
      duration: duration.value,
    })
    emit('updated')
    bus.emit('toast')
  } catch (e) {
    bus.emit('toast', { message: t('toast.error') + e, severity: 'error' })
  } finally {
    loading.value = false
  }
}

</script>