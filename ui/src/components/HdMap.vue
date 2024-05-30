<template>
  <div id="map" style="z-index: 0;"></div>
  <div v-for="device in deviceCollection " :id="'link-' + String(device.id)">
    <h2 class="h2">{{ device.name }}</h2>
    <div class="ml-2 flex-shrink-0 flex">
      <p v-if="device.connected == true"
        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-200 text-green-800">{{
          $t('devices.connected') }}</p>
      <p v-if="device.connected == false"
        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-200 text-white-800">{{
          $t('devices.disconnected') }}</p>
    </div>
    <div class="m-4 flex items-center text-sm text-gray-500 sm:mt-0">
      <div v-if="device.ip != ''" class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
        {{ 'IP: ' + (device.ip || 'N/A') }}
      </div>
      <div v-if="device.ip == ''" class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
        {{ 'IP: ---.---.---.---' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUpdate, onMounted, onBeforeUnmount, ref, watch, onUpdated } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import "leaflet/dist/leaflet.css"
import L from "leaflet";
import DeviceModel from '../Models/DeviceModel';
//import store from '../store';

var router = useRouter()

const props = defineProps<{
  projectId: number,
  deviceCollection: DeviceModel[],
}>()

let map: any
let markerList: any[] = [];
onUpdated(() => {
  var map = L.map('map').setView([51.505, -0.09], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  for (const device of props.deviceCollection) {
    var myIcon = L.icon({
      iconUrl: `/src/assets/device-map/${device.connected ? 'green' : 'orange'}-dot.gif`,
      iconSize: [64, 64],
    })
    markerList.push(
      L.marker([device.lat, device.long], { icon: myIcon }).addTo(map).bindPopup(document.getElementById('link-' + device.id)!).openPopup().closePopup()
    );
  }

  let group = L.featureGroup(markerList).addTo(map);
  try {
    map.fitBounds(group.getBounds());
  } catch (e) {
    console.log('no devices to show on map')
  }

})
onBeforeUnmount(() => {
  if (map) {
    map.remove();
  }
})

</script>

<style scoped>
#map {
  height: 34rem;
}
</style>
