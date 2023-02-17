<template>
  <div id="map" style="z-index: 0;"></div>
  <div v-for="device in deviceCollection " :id="'link-' + String(device.id)">
    <h2 class="h2">{{ device.name }}</h2>
     <div class="ml-2 flex-shrink-0 flex">
                      <p
                        v-if="device.connected==true"
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-200 text-green-800"
                      >{{ $t('devices.connected') }}</p>
                      <p
                        v-if="device.connected==false"
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-200 text-white-800"
                      >{{ $t('devices.disconnected') }}</p>
                    </div>
    <div class="m-4 flex items-center text-sm text-gray-500 sm:mt-0">
      <div v-if="device.ip != ''" class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">{{ 'IP: ' + device.ip }}</div>
      <div v-if="device.ip == ''" class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">{{ 'IP: ---.---.---.---' }}
      </div>
    </div>
    <router-link :to="'/projects/'+ projectId +'/dashboards/'+ device.dashboardId" class="m-3 border-gray-300 text-gray-500 flex justify-center py-2 px-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2">{{ $t('devices.dashboard') }}</router-link>
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
  projectId:number,
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
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=',
      iconSize: [25,41],
    })
    markerList.push(
      L.marker([device.lat, device.long], { icon: myIcon }).addTo(map).bindPopup(document.getElementById('link-' + device.id)!).openPopup().closePopup()
    );
  }

  let group = L.featureGroup(markerList).addTo(map);
  try {
    map.fitBounds(group.getBounds());
  } catch(e){
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
