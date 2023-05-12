<template>
  <div id="grid-stack-dashboard" class="grid-stack" gs-disable-drag="'true'">
    <DashboardTile v-for="(item, index) of dashboardData.tiles" v-model:data="dashboardData.tiles![index]" :id="index"
      :edit="edit" :url="url" @remove="remove"></DashboardTile>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUpdated, ref, watch } from "vue";
import { GridStack, GridStackWidget, ColumnOptions } from "gridstack/dist/gridstack";
import "gridstack/dist/h5/gridstack-dd-native";
import "gridstack/dist/gridstack.min.css";
import DashboardTile from "./DashboardTile.vue";
import DashboardModel from "../Models/DashboardModel"
import TileModel from "../Models/TileModel";

let grid: GridStack;
let newTileId = 0



const emits = defineEmits(['update:save', 'update:add', 'save']);

const dashboardData = ref<DashboardModel>(new DashboardModel())
const dashboardDataToSave = ref<DashboardModel>(new DashboardModel())
const props = defineProps<{
  url: string
  float: boolean
  edit: boolean
  add: boolean
  save: boolean
  data: DashboardModel
}>()

watch(
  props,
  () => {
    if (props.save == true) {
      save()
      emits('update:save', false)
    }
    if (props.add == true) {
      add()
      emits('update:add', false)
    }
    if (props.edit == true) {
      grid.enableMove(true);
      grid.enableResize(true);
    }
    if (props.edit == false) {
      grid.enableMove(false);
      grid.enableResize(false);
    }
    if (props.float == true) {
      grid.float(true);
    }
    if (props.float == false) {
      grid.float(false)
    }
  }
)


onMounted(() => {
  grid = GridStack.init({ float: props.float, disableOneColumnMode:true});
  grid.enableMove(false);
  grid.enableResize(false);
  const gSd = document.getElementById("grid-stack-dashboard")!;
  resizeGrid()
  // resizeGrid()
  window.addEventListener('resize', ()=>resizeGrid());

  gSd.addEventListener("DOMNodeInserted", function (event) {
    if (newTileId > 0) {
      const id = newTileId
      newTileId = 0
      grid.makeWidget("#" + String(id));
    }
  });
});
function init() {
  dashboardData.value = JSON.parse(JSON.stringify(props.data))

}

function save() {
  const layout: GridStackWidget[] = <GridStackWidget[]>grid.save()
  for (const item of layout) {
    const id = Number(item.id!)
    console.log(dashboardData.value.tiles[id])
    dashboardDataToSave.value.tiles[id] = dashboardData.value.tiles[id]
    dashboardDataToSave.value.tiles[id].x = <number>item.x
    dashboardDataToSave.value.tiles[id].y = <number>item.y
    dashboardDataToSave.value.tiles[id].w = <number>item.w
    dashboardDataToSave.value.tiles[id].h = <number>item.h
    dashboardDataToSave.value.float = props.float

  }
  emits('save', dashboardDataToSave.value)
}
async function add() {
  dashboardData.value.tiles.push(new TileModel)
  newTileId = dashboardData.value.tiles.length - 1
}


async function resizeGrid() {
  let layout:ColumnOptions = "none";
  const width = document.body.clientWidth;
  if (width < 700) {
    grid.column(1, layout).cellHeight('100');
  } else if (width < 850) {
    grid.column(2, layout).cellHeight('100');
  } else if (width < 950) {
    grid.column(6, layout).cellHeight('100');
  } else if (width <= 1200) {
    grid.column(6, layout).cellHeight('100');
  } else {
    grid.column(12, layout).cellHeight('100');
  }
}
function remove(id: number) {
  const el = document.getElementById(String(id))
  grid.removeWidget(el!)
}

init()

</script>

<style>
/* Ne pas modifier */

:root .grid-stack-item>.ui-resizable-handle {
  filter: none;
}

.grid-stack {
  position: relative;
}

.grid-stack.grid-stack-rtl {
  direction: ltr;
}

.grid-stack.grid-stack-rtl>.grid-stack-item {
  direction: rtl;
}

.grid-stack .grid-stack-placeholder>.placeholder-content {
  border: 1px dashed lightgray;
  margin: 0;
  position: absolute;
  width: auto;
  z-index: 0 !important;
  text-align: center;
}

.grid-stack>.grid-stack-item {
  min-width: 1%;
  position: absolute;
  padding: 10;
}

.grid-stack>.grid-stack-item>.grid-stack-item-content {
  margin: 5;
  position: absolute;
  width: auto;
  overflow-x: hidden;
  overflow-y: auto;
}

.grid-stack>.grid-stack-item>.ui-resizable-handle {
  position: absolute;
  font-size: 0.1px;
  display: block;
  -ms-touch-action: none;
  touch-action: none;
}

.grid-stack>.grid-stack-item.ui-resizable-disabled>.ui-resizable-handle,
.grid-stack>.grid-stack-item.ui-resizable-autohide>.ui-resizable-handle {
  display: none;
}

.grid-stack>.grid-stack-item.ui-draggable-dragging,
.grid-stack>.grid-stack-item.ui-resizable-resizing {
  z-index: 100;
}

.grid-stack>.grid-stack-item.ui-draggable-dragging>.grid-stack-item-content,
.grid-stack>.grid-stack-item.ui-resizable-resizing>.grid-stack-item-content {
  box-shadow: 1px 4px 6px rgba(0, 0, 0, 0.2);
  opacity: 0.8;
}

.grid-stack>.grid-stack-item>.ui-resizable-se,
.grid-stack>.grid-stack-item>.ui-resizable-sw {
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDUxMS42MjYgNTExLjYyNyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTExLjYyNiA1MTEuNjI3OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTMyOC45MDYsNDAxLjk5NGgtMzYuNTUzVjEwOS42MzZoMzYuNTUzYzQuOTQ4LDAsOS4yMzYtMS44MDksMTIuODQ3LTUuNDI2YzMuNjEzLTMuNjE1LDUuNDIxLTcuODk4LDUuNDIxLTEyLjg0NSAgIGMwLTQuOTQ5LTEuODAxLTkuMjMxLTUuNDI4LTEyLjg1MWwtNzMuMDg3LTczLjA5QzI2NS4wNDQsMS44MDksMjYwLjc2LDAsMjU1LjgxMywwYy00Ljk0OCwwLTkuMjI5LDEuODA5LTEyLjg0Nyw1LjQyNCAgIGwtNzMuMDg4LDczLjA5Yy0zLjYxOCwzLjYxOS01LjQyNCw3LjkwMi01LjQyNCwxMi44NTFjMCw0Ljk0NiwxLjgwNyw5LjIyOSw1LjQyNCwxMi44NDVjMy42MTksMy42MTcsNy45MDEsNS40MjYsMTIuODUsNS40MjYgICBoMzYuNTQ1djI5Mi4zNThoLTM2LjU0MmMtNC45NTIsMC05LjIzNSwxLjgwOC0xMi44NSw1LjQyMWMtMy42MTcsMy42MjEtNS40MjQsNy45MDUtNS40MjQsMTIuODU0ICAgYzAsNC45NDUsMS44MDcsOS4yMjcsNS40MjQsMTIuODQ3bDczLjA4OSw3My4wODhjMy42MTcsMy42MTcsNy44OTgsNS40MjQsMTIuODQ3LDUuNDI0YzQuOTUsMCw5LjIzNC0xLjgwNywxMi44NDktNS40MjQgICBsNzMuMDg3LTczLjA4OGMzLjYxMy0zLjYyLDUuNDIxLTcuOTAxLDUuNDIxLTEyLjg0N2MwLTQuOTQ4LTEuODA4LTkuMjMyLTUuNDIxLTEyLjg1NCAgIEMzMzguMTQyLDQwMy44MDIsMzMzLjg1Nyw0MDEuOTk0LDMyOC45MDYsNDAxLjk5NHoiIGZpbGw9IiM2NjY2NjYiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K);
  background-repeat: no-repeat;
  background-position: center;
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  transform: rotate(45deg);
}

.grid-stack>.grid-stack-item>.ui-resizable-se {
  -webkit-transform: rotate(-45deg);
  -moz-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  -o-transform: rotate(-45deg);
  transform: rotate(-45deg);
}

.grid-stack>.grid-stack-item>.ui-resizable-nw {
  cursor: nw-resize;
  width: 20px;
  height: 20px;
  top: 0;
}

.grid-stack>.grid-stack-item>.ui-resizable-n {
  cursor: n-resize;
  height: 10px;
  top: 0;
  left: 25px;
  right: 25px;
}

.grid-stack>.grid-stack-item>.ui-resizable-ne {
  cursor: ne-resize;
  width: 20px;
  height: 20px;
  top: 0;
}

.grid-stack>.grid-stack-item>.ui-resizable-e {
  cursor: e-resize;
  width: 10px;
  top: 15px;
  bottom: 15px;
}

.grid-stack>.grid-stack-item>.ui-resizable-se {
  cursor: se-resize;
  width: 20px;
  height: 20px;
}

.grid-stack>.grid-stack-item>.ui-resizable-s {
  cursor: s-resize;
  height: 10px;
  left: 25px;
  bottom: 0;
  right: 25px;
}

.grid-stack>.grid-stack-item>.ui-resizable-sw {
  cursor: sw-resize;
  width: 20px;
  height: 20px;
}

.grid-stack>.grid-stack-item>.ui-resizable-w {
  cursor: w-resize;
  width: 10px;
  top: 15px;
  bottom: 15px;
}

.grid-stack>.grid-stack-item.ui-draggable-dragging>.ui-resizable-handle {
  display: none !important;
}

/* .grid-stack>.grid-stack-item[gs-w="0"] {
  width: 0%;
}

.grid-stack>.grid-stack-item[gs-x="0"] {
  left: 0%;
}

.grid-stack>.grid-stack-item[gs-min-w="0"] {
  min-width: 0%;
}

.grid-stack>.grid-stack-item[gs-max-w="0"] {
  max-width: 0%;
}

.grid-stack>.grid-stack-item[gs-w="1"] {
  width: 1%;
}

.grid-stack>.grid-stack-item[gs-x="1"] {
  left: 1%;
}

.grid-stack>.grid-stack-item[gs-min-w="1"] {
  min-width: 1%;
}

.grid-stack>.grid-stack-item[gs-max-w="1"] {
  max-width: 1%;
}

.grid-stack>.grid-stack-item[gs-w="2"] {
  width: 2%;
}

.grid-stack>.grid-stack-item[gs-x="2"] {
  left: 2%;
}

.grid-stack>.grid-stack-item[gs-min-w="2"] {
  min-width: 2%;
}

.grid-stack>.grid-stack-item[gs-max-w="2"] {
  max-width: 2%;
}

.grid-stack>.grid-stack-item[gs-w="3"] {
  width: 3%;
}

.grid-stack>.grid-stack-item[gs-x="3"] {
  left: 3%;
}

.grid-stack>.grid-stack-item[gs-min-w="3"] {
  min-width: 3%;
}

.grid-stack>.grid-stack-item[gs-max-w="3"] {
  max-width: 3%;
}

.grid-stack>.grid-stack-item[gs-w="4"] {
  width: 4%;
}

.grid-stack>.grid-stack-item[gs-x="4"] {
  left: 4%;
}

.grid-stack>.grid-stack-item[gs-min-w="4"] {
  min-width: 4%;
}

.grid-stack>.grid-stack-item[gs-max-w="4"] {
  max-width: 4%;
}

.grid-stack>.grid-stack-item[gs-w="5"] {
  width: 5%;
}

.grid-stack>.grid-stack-item[gs-x="5"] {
  left: 5%;
}

.grid-stack>.grid-stack-item[gs-min-w="5"] {
  min-width: 5%;
}

.grid-stack>.grid-stack-item[gs-max-w="5"] {
  max-width: 5%;
}

.grid-stack>.grid-stack-item[gs-w="6"] {
  width: 6%;
}

.grid-stack>.grid-stack-item[gs-x="6"] {
  left: 6%;
}

.grid-stack>.grid-stack-item[gs-min-w="6"] {
  min-width: 6%;
}

.grid-stack>.grid-stack-item[gs-max-w="6"] {
  max-width: 6%;
}

.grid-stack>.grid-stack-item[gs-w="7"] {
  width: 7%;
}

.grid-stack>.grid-stack-item[gs-x="7"] {
  left: 7%;
}

.grid-stack>.grid-stack-item[gs-min-w="7"] {
  min-width: 7%;
}

.grid-stack>.grid-stack-item[gs-max-w="7"] {
  max-width: 7%;
}

.grid-stack>.grid-stack-item[gs-w="8"] {
  width: 8%;
}

.grid-stack>.grid-stack-item[gs-x="8"] {
  left: 8%;
}

.grid-stack>.grid-stack-item[gs-min-w="8"] {
  min-width: 8%;
}

.grid-stack>.grid-stack-item[gs-max-w="8"] {
  max-width: 8%;
}

.grid-stack>.grid-stack-item[gs-w="9"] {
  width: 9%;
}

.grid-stack>.grid-stack-item[gs-x="9"] {
  left: 9%;
}

.grid-stack>.grid-stack-item[gs-min-w="9"] {
  min-width: 9%;
}

.grid-stack>.grid-stack-item[gs-max-w="9"] {
  max-width: 9%;
}

.grid-stack>.grid-stack-item[gs-w="10"] {
  width: 10%;
}

.grid-stack>.grid-stack-item[gs-x="10"] {
  left: 10%;
}

.grid-stack>.grid-stack-item[gs-min-w="10"] {
  min-width: 10%;
}

.grid-stack>.grid-stack-item[gs-max-w="10"] {
  max-width: 10%;
}

.grid-stack>.grid-stack-item[gs-w="11"] {
  width: 11%;
}

.grid-stack>.grid-stack-item[gs-x="11"] {
  left: 11%;
}

.grid-stack>.grid-stack-item[gs-min-w="11"] {
  min-width: 11%;
}

.grid-stack>.grid-stack-item[gs-max-w="11"] {
  max-width: 11%;
}

.grid-stack>.grid-stack-item[gs-w="12"] {
  width: 12%;
}

.grid-stack>.grid-stack-item[gs-x="12"] {
  left: 12%;
}

.grid-stack>.grid-stack-item[gs-min-w="12"] {
  min-width: 12%;
}

.grid-stack>.grid-stack-item[gs-max-w="12"] {
  max-width: 12%;
}

.grid-stack>.grid-stack-item[gs-w="13"] {
  width: 13%;
}

.grid-stack>.grid-stack-item[gs-x="13"] {
  left: 13%;
}

.grid-stack>.grid-stack-item[gs-min-w="13"] {
  min-width: 13%;
}

.grid-stack>.grid-stack-item[gs-max-w="13"] {
  max-width: 13%;
}

.grid-stack>.grid-stack-item[gs-w="14"] {
  width: 14%;
}

.grid-stack>.grid-stack-item[gs-x="14"] {
  left: 14%;
}

.grid-stack>.grid-stack-item[gs-min-w="14"] {
  min-width: 14%;
}

.grid-stack>.grid-stack-item[gs-max-w="14"] {
  max-width: 14%;
}

.grid-stack>.grid-stack-item[gs-w="15"] {
  width: 15%;
}

.grid-stack>.grid-stack-item[gs-x="15"] {
  left: 15%;
}

.grid-stack>.grid-stack-item[gs-min-w="15"] {
  min-width: 15%;
}

.grid-stack>.grid-stack-item[gs-max-w="15"] {
  max-width: 15%;
}

.grid-stack>.grid-stack-item[gs-w="16"] {
  width: 16%;
}

.grid-stack>.grid-stack-item[gs-x="16"] {
  left: 16%;
}

.grid-stack>.grid-stack-item[gs-min-w="16"] {
  min-width: 16%;
}

.grid-stack>.grid-stack-item[gs-max-w="16"] {
  max-width: 16%;
}

.grid-stack>.grid-stack-item[gs-w="17"] {
  width: 17%;
}

.grid-stack>.grid-stack-item[gs-x="17"] {
  left: 17%;
}

.grid-stack>.grid-stack-item[gs-min-w="17"] {
  min-width: 17%;
}

.grid-stack>.grid-stack-item[gs-max-w="17"] {
  max-width: 17%;
}

.grid-stack>.grid-stack-item[gs-w="18"] {
  width: 18%;
}

.grid-stack>.grid-stack-item[gs-x="18"] {
  left: 18%;
}

.grid-stack>.grid-stack-item[gs-min-w="18"] {
  min-width: 18%;
}

.grid-stack>.grid-stack-item[gs-max-w="18"] {
  max-width: 18%;
}

.grid-stack>.grid-stack-item[gs-w="19"] {
  width: 19%;
}

.grid-stack>.grid-stack-item[gs-x="19"] {
  left: 19%;
}

.grid-stack>.grid-stack-item[gs-min-w="19"] {
  min-width: 19%;
}

.grid-stack>.grid-stack-item[gs-max-w="19"] {
  max-width: 19%;
}

.grid-stack>.grid-stack-item[gs-w="20"] {
  width: 20%;
}

.grid-stack>.grid-stack-item[gs-x="20"] {
  left: 20%;
}

.grid-stack>.grid-stack-item[gs-min-w="20"] {
  min-width: 20%;
}

.grid-stack>.grid-stack-item[gs-max-w="20"] {
  max-width: 20%;
}

.grid-stack>.grid-stack-item[gs-w="21"] {
  width: 21%;
}

.grid-stack>.grid-stack-item[gs-x="21"] {
  left: 21%;
}

.grid-stack>.grid-stack-item[gs-min-w="21"] {
  min-width: 21%;
}

.grid-stack>.grid-stack-item[gs-max-w="21"] {
  max-width: 21%;
}

.grid-stack>.grid-stack-item[gs-w="22"] {
  width: 22%;
}

.grid-stack>.grid-stack-item[gs-x="22"] {
  left: 22%;
}

.grid-stack>.grid-stack-item[gs-min-w="22"] {
  min-width: 22%;
}

.grid-stack>.grid-stack-item[gs-max-w="22"] {
  max-width: 22%;
}

.grid-stack>.grid-stack-item[gs-w="23"] {
  width: 23%;
}

.grid-stack>.grid-stack-item[gs-x="23"] {
  left: 23%;
}

.grid-stack>.grid-stack-item[gs-min-w="23"] {
  min-width: 23%;
}

.grid-stack>.grid-stack-item[gs-max-w="23"] {
  max-width: 23%;
}

.grid-stack>.grid-stack-item[gs-w="24"] {
  width: 24%;
}

.grid-stack>.grid-stack-item[gs-x="24"] {
  left: 24%;
}

.grid-stack>.grid-stack-item[gs-min-w="24"] {
  min-width: 24%;
}

.grid-stack>.grid-stack-item[gs-max-w="24"] {
  max-width: 24%;
}

.grid-stack>.grid-stack-item[gs-w="25"] {
  width: 25%;
}

.grid-stack>.grid-stack-item[gs-x="25"] {
  left: 25%;
}

.grid-stack>.grid-stack-item[gs-min-w="25"] {
  min-width: 25%;
}

.grid-stack>.grid-stack-item[gs-max-w="25"] {
  max-width: 25%;
}

.grid-stack>.grid-stack-item[gs-w="26"] {
  width: 26%;
}

.grid-stack>.grid-stack-item[gs-x="26"] {
  left: 26%;
}

.grid-stack>.grid-stack-item[gs-min-w="26"] {
  min-width: 26%;
}

.grid-stack>.grid-stack-item[gs-max-w="26"] {
  max-width: 26%;
}

.grid-stack>.grid-stack-item[gs-w="27"] {
  width: 27%;
}

.grid-stack>.grid-stack-item[gs-x="27"] {
  left: 27%;
}

.grid-stack>.grid-stack-item[gs-min-w="27"] {
  min-width: 27%;
}

.grid-stack>.grid-stack-item[gs-max-w="27"] {
  max-width: 27%;
}

.grid-stack>.grid-stack-item[gs-w="28"] {
  width: 28%;
}

.grid-stack>.grid-stack-item[gs-x="28"] {
  left: 28%;
}

.grid-stack>.grid-stack-item[gs-min-w="28"] {
  min-width: 28%;
}

.grid-stack>.grid-stack-item[gs-max-w="28"] {
  max-width: 28%;
}

.grid-stack>.grid-stack-item[gs-w="29"] {
  width: 29%;
}

.grid-stack>.grid-stack-item[gs-x="29"] {
  left: 29%;
}

.grid-stack>.grid-stack-item[gs-min-w="29"] {
  min-width: 29%;
}

.grid-stack>.grid-stack-item[gs-max-w="29"] {
  max-width: 29%;
}

.grid-stack>.grid-stack-item[gs-w="30"] {
  width: 30%;
}

.grid-stack>.grid-stack-item[gs-x="30"] {
  left: 30%;
}

.grid-stack>.grid-stack-item[gs-min-w="30"] {
  min-width: 30%;
}

.grid-stack>.grid-stack-item[gs-max-w="30"] {
  max-width: 30%;
}

.grid-stack>.grid-stack-item[gs-w="31"] {
  width: 31%;
}

.grid-stack>.grid-stack-item[gs-x="31"] {
  left: 31%;
}

.grid-stack>.grid-stack-item[gs-min-w="31"] {
  min-width: 31%;
}

.grid-stack>.grid-stack-item[gs-max-w="31"] {
  max-width: 31%;
}

.grid-stack>.grid-stack-item[gs-w="32"] {
  width: 32%;
}

.grid-stack>.grid-stack-item[gs-x="32"] {
  left: 32%;
}

.grid-stack>.grid-stack-item[gs-min-w="32"] {
  min-width: 32%;
}

.grid-stack>.grid-stack-item[gs-max-w="32"] {
  max-width: 32%;
}

.grid-stack>.grid-stack-item[gs-w="33"] {
  width: 33%;
}

.grid-stack>.grid-stack-item[gs-x="33"] {
  left: 33%;
}

.grid-stack>.grid-stack-item[gs-min-w="33"] {
  min-width: 33%;
}

.grid-stack>.grid-stack-item[gs-max-w="33"] {
  max-width: 33%;
}

.grid-stack>.grid-stack-item[gs-w="34"] {
  width: 34%;
}

.grid-stack>.grid-stack-item[gs-x="34"] {
  left: 34%;
}

.grid-stack>.grid-stack-item[gs-min-w="34"] {
  min-width: 34%;
}

.grid-stack>.grid-stack-item[gs-max-w="34"] {
  max-width: 34%;
}

.grid-stack>.grid-stack-item[gs-w="35"] {
  width: 35%;
}

.grid-stack>.grid-stack-item[gs-x="35"] {
  left: 35%;
}

.grid-stack>.grid-stack-item[gs-min-w="35"] {
  min-width: 35%;
}

.grid-stack>.grid-stack-item[gs-max-w="35"] {
  max-width: 35%;
}

.grid-stack>.grid-stack-item[gs-w="36"] {
  width: 36%;
}

.grid-stack>.grid-stack-item[gs-x="36"] {
  left: 36%;
}

.grid-stack>.grid-stack-item[gs-min-w="36"] {
  min-width: 36%;
}

.grid-stack>.grid-stack-item[gs-max-w="36"] {
  max-width: 36%;
}

.grid-stack>.grid-stack-item[gs-w="37"] {
  width: 37%;
}

.grid-stack>.grid-stack-item[gs-x="37"] {
  left: 37%;
}

.grid-stack>.grid-stack-item[gs-min-w="37"] {
  min-width: 37%;
}

.grid-stack>.grid-stack-item[gs-max-w="37"] {
  max-width: 37%;
}

.grid-stack>.grid-stack-item[gs-w="38"] {
  width: 38%;
}

.grid-stack>.grid-stack-item[gs-x="38"] {
  left: 38%;
}

.grid-stack>.grid-stack-item[gs-min-w="38"] {
  min-width: 38%;
}

.grid-stack>.grid-stack-item[gs-max-w="38"] {
  max-width: 38%;
}

.grid-stack>.grid-stack-item[gs-w="39"] {
  width: 39%;
}

.grid-stack>.grid-stack-item[gs-x="39"] {
  left: 39%;
}

.grid-stack>.grid-stack-item[gs-min-w="39"] {
  min-width: 39%;
}

.grid-stack>.grid-stack-item[gs-max-w="39"] {
  max-width: 39%;
}

.grid-stack>.grid-stack-item[gs-w="40"] {
  width: 40%;
}

.grid-stack>.grid-stack-item[gs-x="40"] {
  left: 40%;
}

.grid-stack>.grid-stack-item[gs-min-w="40"] {
  min-width: 40%;
}

.grid-stack>.grid-stack-item[gs-max-w="40"] {
  max-width: 40%;
}

.grid-stack>.grid-stack-item[gs-w="41"] {
  width: 41%;
}

.grid-stack>.grid-stack-item[gs-x="41"] {
  left: 41%;
}

.grid-stack>.grid-stack-item[gs-min-w="41"] {
  min-width: 41%;
}

.grid-stack>.grid-stack-item[gs-max-w="41"] {
  max-width: 41%;
}

.grid-stack>.grid-stack-item[gs-w="42"] {
  width: 42%;
}

.grid-stack>.grid-stack-item[gs-x="42"] {
  left: 42%;
}

.grid-stack>.grid-stack-item[gs-min-w="42"] {
  min-width: 42%;
}

.grid-stack>.grid-stack-item[gs-max-w="42"] {
  max-width: 42%;
}

.grid-stack>.grid-stack-item[gs-w="43"] {
  width: 43%;
}

.grid-stack>.grid-stack-item[gs-x="43"] {
  left: 43%;
}

.grid-stack>.grid-stack-item[gs-min-w="43"] {
  min-width: 43%;
}

.grid-stack>.grid-stack-item[gs-max-w="43"] {
  max-width: 43%;
}

.grid-stack>.grid-stack-item[gs-w="44"] {
  width: 44%;
}

.grid-stack>.grid-stack-item[gs-x="44"] {
  left: 44%;
}

.grid-stack>.grid-stack-item[gs-min-w="44"] {
  min-width: 44%;
}

.grid-stack>.grid-stack-item[gs-max-w="44"] {
  max-width: 44%;
}

.grid-stack>.grid-stack-item[gs-w="45"] {
  width: 45%;
}

.grid-stack>.grid-stack-item[gs-x="45"] {
  left: 45%;
}

.grid-stack>.grid-stack-item[gs-min-w="45"] {
  min-width: 45%;
}

.grid-stack>.grid-stack-item[gs-max-w="45"] {
  max-width: 45%;
}

.grid-stack>.grid-stack-item[gs-w="46"] {
  width: 46%;
}

.grid-stack>.grid-stack-item[gs-x="46"] {
  left: 46%;
}

.grid-stack>.grid-stack-item[gs-min-w="46"] {
  min-width: 46%;
}

.grid-stack>.grid-stack-item[gs-max-w="46"] {
  max-width: 46%;
}

.grid-stack>.grid-stack-item[gs-w="47"] {
  width: 47%;
}

.grid-stack>.grid-stack-item[gs-x="47"] {
  left: 47%;
}

.grid-stack>.grid-stack-item[gs-min-w="47"] {
  min-width: 47%;
}

.grid-stack>.grid-stack-item[gs-max-w="47"] {
  max-width: 47%;
}

.grid-stack>.grid-stack-item[gs-w="48"] {
  width: 48%;
}

.grid-stack>.grid-stack-item[gs-x="48"] {
  left: 48%;
}

.grid-stack>.grid-stack-item[gs-min-w="48"] {
  min-width: 48%;
}

.grid-stack>.grid-stack-item[gs-max-w="48"] {
  max-width: 48%;
}

.grid-stack>.grid-stack-item[gs-w="49"] {
  width: 49%;
}

.grid-stack>.grid-stack-item[gs-x="49"] {
  left: 49%;
}

.grid-stack>.grid-stack-item[gs-min-w="49"] {
  min-width: 49%;
}

.grid-stack>.grid-stack-item[gs-max-w="49"] {
  max-width: 49%;
}

.grid-stack>.grid-stack-item[gs-w="50"] {
  width: 50%;
}

.grid-stack>.grid-stack-item[gs-x="50"] {
  left: 50%;
}

.grid-stack>.grid-stack-item[gs-min-w="50"] {
  min-width: 50%;
}

.grid-stack>.grid-stack-item[gs-max-w="50"] {
  max-width: 50%;
}

.grid-stack>.grid-stack-item[gs-w="51"] {
  width: 51%;
}

.grid-stack>.grid-stack-item[gs-x="51"] {
  left: 51%;
}

.grid-stack>.grid-stack-item[gs-min-w="51"] {
  min-width: 51%;
}

.grid-stack>.grid-stack-item[gs-max-w="51"] {
  max-width: 51%;
}

.grid-stack>.grid-stack-item[gs-w="52"] {
  width: 52%;
}

.grid-stack>.grid-stack-item[gs-x="52"] {
  left: 52%;
}

.grid-stack>.grid-stack-item[gs-min-w="52"] {
  min-width: 52%;
}

.grid-stack>.grid-stack-item[gs-max-w="52"] {
  max-width: 52%;
}

.grid-stack>.grid-stack-item[gs-w="53"] {
  width: 53%;
}

.grid-stack>.grid-stack-item[gs-x="53"] {
  left: 53%;
}

.grid-stack>.grid-stack-item[gs-min-w="53"] {
  min-width: 53%;
}

.grid-stack>.grid-stack-item[gs-max-w="53"] {
  max-width: 53%;
}

.grid-stack>.grid-stack-item[gs-w="54"] {
  width: 54%;
}

.grid-stack>.grid-stack-item[gs-x="54"] {
  left: 54%;
}

.grid-stack>.grid-stack-item[gs-min-w="54"] {
  min-width: 54%;
}

.grid-stack>.grid-stack-item[gs-max-w="54"] {
  max-width: 54%;
}

.grid-stack>.grid-stack-item[gs-w="55"] {
  width: 55%;
}

.grid-stack>.grid-stack-item[gs-x="55"] {
  left: 55%;
}

.grid-stack>.grid-stack-item[gs-min-w="55"] {
  min-width: 55%;
}

.grid-stack>.grid-stack-item[gs-max-w="55"] {
  max-width: 55%;
}

.grid-stack>.grid-stack-item[gs-w="56"] {
  width: 56%;
}

.grid-stack>.grid-stack-item[gs-x="56"] {
  left: 56%;
}

.grid-stack>.grid-stack-item[gs-min-w="56"] {
  min-width: 56%;
}

.grid-stack>.grid-stack-item[gs-max-w="56"] {
  max-width: 56%;
}

.grid-stack>.grid-stack-item[gs-w="57"] {
  width: 57%;
}

.grid-stack>.grid-stack-item[gs-x="57"] {
  left: 57%;
}

.grid-stack>.grid-stack-item[gs-min-w="57"] {
  min-width: 57%;
}

.grid-stack>.grid-stack-item[gs-max-w="57"] {
  max-width: 57%;
}

.grid-stack>.grid-stack-item[gs-w="58"] {
  width: 58%;
}

.grid-stack>.grid-stack-item[gs-x="58"] {
  left: 58%;
}

.grid-stack>.grid-stack-item[gs-min-w="58"] {
  min-width: 58%;
}

.grid-stack>.grid-stack-item[gs-max-w="58"] {
  max-width: 58%;
}

.grid-stack>.grid-stack-item[gs-w="59"] {
  width: 59%;
}

.grid-stack>.grid-stack-item[gs-x="59"] {
  left: 59%;
}

.grid-stack>.grid-stack-item[gs-min-w="59"] {
  min-width: 59%;
}

.grid-stack>.grid-stack-item[gs-max-w="59"] {
  max-width: 59%;
}

.grid-stack>.grid-stack-item[gs-w="60"] {
  width: 60%;
}

.grid-stack>.grid-stack-item[gs-x="60"] {
  left: 60%;
}

.grid-stack>.grid-stack-item[gs-min-w="60"] {
  min-width: 60%;
}

.grid-stack>.grid-stack-item[gs-max-w="60"] {
  max-width: 60%;
}

.grid-stack>.grid-stack-item[gs-w="61"] {
  width: 61%;
}

.grid-stack>.grid-stack-item[gs-x="61"] {
  left: 61%;
}

.grid-stack>.grid-stack-item[gs-min-w="61"] {
  min-width: 61%;
}

.grid-stack>.grid-stack-item[gs-max-w="61"] {
  max-width: 61%;
}

.grid-stack>.grid-stack-item[gs-w="62"] {
  width: 62%;
}

.grid-stack>.grid-stack-item[gs-x="62"] {
  left: 62%;
}

.grid-stack>.grid-stack-item[gs-min-w="62"] {
  min-width: 62%;
}

.grid-stack>.grid-stack-item[gs-max-w="62"] {
  max-width: 62%;
}

.grid-stack>.grid-stack-item[gs-w="63"] {
  width: 63%;
}

.grid-stack>.grid-stack-item[gs-x="63"] {
  left: 63%;
}

.grid-stack>.grid-stack-item[gs-min-w="63"] {
  min-width: 63%;
}

.grid-stack>.grid-stack-item[gs-max-w="63"] {
  max-width: 63%;
}

.grid-stack>.grid-stack-item[gs-w="64"] {
  width: 64%;
}

.grid-stack>.grid-stack-item[gs-x="64"] {
  left: 64%;
}

.grid-stack>.grid-stack-item[gs-min-w="64"] {
  min-width: 64%;
}

.grid-stack>.grid-stack-item[gs-max-w="64"] {
  max-width: 64%;
}

.grid-stack>.grid-stack-item[gs-w="65"] {
  width: 65%;
}

.grid-stack>.grid-stack-item[gs-x="65"] {
  left: 65%;
}

.grid-stack>.grid-stack-item[gs-min-w="65"] {
  min-width: 65%;
}

.grid-stack>.grid-stack-item[gs-max-w="65"] {
  max-width: 65%;
}

.grid-stack>.grid-stack-item[gs-w="66"] {
  width: 66%;
}

.grid-stack>.grid-stack-item[gs-x="66"] {
  left: 66%;
}

.grid-stack>.grid-stack-item[gs-min-w="66"] {
  min-width: 66%;
}

.grid-stack>.grid-stack-item[gs-max-w="66"] {
  max-width: 66%;
}

.grid-stack>.grid-stack-item[gs-w="67"] {
  width: 67%;
}

.grid-stack>.grid-stack-item[gs-x="67"] {
  left: 67%;
}

.grid-stack>.grid-stack-item[gs-min-w="67"] {
  min-width: 67%;
}

.grid-stack>.grid-stack-item[gs-max-w="67"] {
  max-width: 67%;
}

.grid-stack>.grid-stack-item[gs-w="68"] {
  width: 68%;
}

.grid-stack>.grid-stack-item[gs-x="68"] {
  left: 68%;
}

.grid-stack>.grid-stack-item[gs-min-w="68"] {
  min-width: 68%;
}

.grid-stack>.grid-stack-item[gs-max-w="68"] {
  max-width: 68%;
}

.grid-stack>.grid-stack-item[gs-w="69"] {
  width: 69%;
}

.grid-stack>.grid-stack-item[gs-x="69"] {
  left: 69%;
}

.grid-stack>.grid-stack-item[gs-min-w="69"] {
  min-width: 69%;
}

.grid-stack>.grid-stack-item[gs-max-w="69"] {
  max-width: 69%;
}

.grid-stack>.grid-stack-item[gs-w="70"] {
  width: 70%;
}

.grid-stack>.grid-stack-item[gs-x="70"] {
  left: 70%;
}

.grid-stack>.grid-stack-item[gs-min-w="70"] {
  min-width: 70%;
}

.grid-stack>.grid-stack-item[gs-max-w="70"] {
  max-width: 70%;
}

.grid-stack>.grid-stack-item[gs-w="71"] {
  width: 71%;
}

.grid-stack>.grid-stack-item[gs-x="71"] {
  left: 71%;
}

.grid-stack>.grid-stack-item[gs-min-w="71"] {
  min-width: 71%;
}

.grid-stack>.grid-stack-item[gs-max-w="71"] {
  max-width: 71%;
}

.grid-stack>.grid-stack-item[gs-w="72"] {
  width: 72%;
}

.grid-stack>.grid-stack-item[gs-x="72"] {
  left: 72%;
}

.grid-stack>.grid-stack-item[gs-min-w="72"] {
  min-width: 72%;
}

.grid-stack>.grid-stack-item[gs-max-w="72"] {
  max-width: 72%;
}

.grid-stack>.grid-stack-item[gs-w="73"] {
  width: 73%;
}

.grid-stack>.grid-stack-item[gs-x="73"] {
  left: 73%;
}

.grid-stack>.grid-stack-item[gs-min-w="73"] {
  min-width: 73%;
}

.grid-stack>.grid-stack-item[gs-max-w="73"] {
  max-width: 73%;
}

.grid-stack>.grid-stack-item[gs-w="74"] {
  width: 74%;
}

.grid-stack>.grid-stack-item[gs-x="74"] {
  left: 74%;
}

.grid-stack>.grid-stack-item[gs-min-w="74"] {
  min-width: 74%;
}

.grid-stack>.grid-stack-item[gs-max-w="74"] {
  max-width: 74%;
}

.grid-stack>.grid-stack-item[gs-w="75"] {
  width: 75%;
}

.grid-stack>.grid-stack-item[gs-x="75"] {
  left: 75%;
}

.grid-stack>.grid-stack-item[gs-min-w="75"] {
  min-width: 75%;
}

.grid-stack>.grid-stack-item[gs-max-w="75"] {
  max-width: 75%;
}

.grid-stack>.grid-stack-item[gs-w="76"] {
  width: 76%;
}

.grid-stack>.grid-stack-item[gs-x="76"] {
  left: 76%;
}

.grid-stack>.grid-stack-item[gs-min-w="76"] {
  min-width: 76%;
}

.grid-stack>.grid-stack-item[gs-max-w="76"] {
  max-width: 76%;
}

.grid-stack>.grid-stack-item[gs-w="77"] {
  width: 77%;
}

.grid-stack>.grid-stack-item[gs-x="77"] {
  left: 77%;
}

.grid-stack>.grid-stack-item[gs-min-w="77"] {
  min-width: 77%;
}

.grid-stack>.grid-stack-item[gs-max-w="77"] {
  max-width: 77%;
}

.grid-stack>.grid-stack-item[gs-w="78"] {
  width: 78%;
}

.grid-stack>.grid-stack-item[gs-x="78"] {
  left: 78%;
}

.grid-stack>.grid-stack-item[gs-min-w="78"] {
  min-width: 78%;
}

.grid-stack>.grid-stack-item[gs-max-w="78"] {
  max-width: 78%;
}

.grid-stack>.grid-stack-item[gs-w="79"] {
  width: 79%;
}

.grid-stack>.grid-stack-item[gs-x="79"] {
  left: 79%;
}

.grid-stack>.grid-stack-item[gs-min-w="79"] {
  min-width: 79%;
}

.grid-stack>.grid-stack-item[gs-max-w="79"] {
  max-width: 79%;
}

.grid-stack>.grid-stack-item[gs-w="80"] {
  width: 80%;
}

.grid-stack>.grid-stack-item[gs-x="80"] {
  left: 80%;
}

.grid-stack>.grid-stack-item[gs-min-w="80"] {
  min-width: 80%;
}

.grid-stack>.grid-stack-item[gs-max-w="80"] {
  max-width: 80%;
}

.grid-stack>.grid-stack-item[gs-w="81"] {
  width: 81%;
}

.grid-stack>.grid-stack-item[gs-x="81"] {
  left: 81%;
}

.grid-stack>.grid-stack-item[gs-min-w="81"] {
  min-width: 81%;
}

.grid-stack>.grid-stack-item[gs-max-w="81"] {
  max-width: 81%;
}

.grid-stack>.grid-stack-item[gs-w="82"] {
  width: 82%;
}

.grid-stack>.grid-stack-item[gs-x="82"] {
  left: 82%;
}

.grid-stack>.grid-stack-item[gs-min-w="82"] {
  min-width: 82%;
}

.grid-stack>.grid-stack-item[gs-max-w="82"] {
  max-width: 82%;
}

.grid-stack>.grid-stack-item[gs-w="83"] {
  width: 83%;
}

.grid-stack>.grid-stack-item[gs-x="83"] {
  left: 83%;
}

.grid-stack>.grid-stack-item[gs-min-w="83"] {
  min-width: 83%;
}

.grid-stack>.grid-stack-item[gs-max-w="83"] {
  max-width: 83%;
}

.grid-stack>.grid-stack-item[gs-w="84"] {
  width: 84%;
}

.grid-stack>.grid-stack-item[gs-x="84"] {
  left: 84%;
}

.grid-stack>.grid-stack-item[gs-min-w="84"] {
  min-width: 84%;
}

.grid-stack>.grid-stack-item[gs-max-w="84"] {
  max-width: 84%;
}

.grid-stack>.grid-stack-item[gs-w="85"] {
  width: 85%;
}

.grid-stack>.grid-stack-item[gs-x="85"] {
  left: 85%;
}

.grid-stack>.grid-stack-item[gs-min-w="85"] {
  min-width: 85%;
}

.grid-stack>.grid-stack-item[gs-max-w="85"] {
  max-width: 85%;
}

.grid-stack>.grid-stack-item[gs-w="86"] {
  width: 86%;
}

.grid-stack>.grid-stack-item[gs-x="86"] {
  left: 86%;
}

.grid-stack>.grid-stack-item[gs-min-w="86"] {
  min-width: 86%;
}

.grid-stack>.grid-stack-item[gs-max-w="86"] {
  max-width: 86%;
}

.grid-stack>.grid-stack-item[gs-w="87"] {
  width: 87%;
}

.grid-stack>.grid-stack-item[gs-x="87"] {
  left: 87%;
}

.grid-stack>.grid-stack-item[gs-min-w="87"] {
  min-width: 87%;
}

.grid-stack>.grid-stack-item[gs-max-w="87"] {
  max-width: 87%;
}

.grid-stack>.grid-stack-item[gs-w="88"] {
  width: 88%;
}

.grid-stack>.grid-stack-item[gs-x="88"] {
  left: 88%;
}

.grid-stack>.grid-stack-item[gs-min-w="88"] {
  min-width: 88%;
}

.grid-stack>.grid-stack-item[gs-max-w="88"] {
  max-width: 88%;
}

.grid-stack>.grid-stack-item[gs-w="89"] {
  width: 89%;
}

.grid-stack>.grid-stack-item[gs-x="89"] {
  left: 89%;
}

.grid-stack>.grid-stack-item[gs-min-w="89"] {
  min-width: 89%;
}

.grid-stack>.grid-stack-item[gs-max-w="89"] {
  max-width: 89%;
}

.grid-stack>.grid-stack-item[gs-w="90"] {
  width: 90%;
}

.grid-stack>.grid-stack-item[gs-x="90"] {
  left: 90%;
}

.grid-stack>.grid-stack-item[gs-min-w="90"] {
  min-width: 90%;
}

.grid-stack>.grid-stack-item[gs-max-w="90"] {
  max-width: 90%;
}

.grid-stack>.grid-stack-item[gs-w="91"] {
  width: 91%;
}

.grid-stack>.grid-stack-item[gs-x="91"] {
  left: 91%;
}

.grid-stack>.grid-stack-item[gs-min-w="91"] {
  min-width: 91%;
}

.grid-stack>.grid-stack-item[gs-max-w="91"] {
  max-width: 91%;
}

.grid-stack>.grid-stack-item[gs-w="92"] {
  width: 92%;
}

.grid-stack>.grid-stack-item[gs-x="92"] {
  left: 92%;
}

.grid-stack>.grid-stack-item[gs-min-w="92"] {
  min-width: 92%;
}

.grid-stack>.grid-stack-item[gs-max-w="92"] {
  max-width: 92%;
}

.grid-stack>.grid-stack-item[gs-w="93"] {
  width: 93%;
}

.grid-stack>.grid-stack-item[gs-x="93"] {
  left: 93%;
}

.grid-stack>.grid-stack-item[gs-min-w="93"] {
  min-width: 93%;
}

.grid-stack>.grid-stack-item[gs-max-w="93"] {
  max-width: 93%;
}

.grid-stack>.grid-stack-item[gs-w="94"] {
  width: 94%;
}

.grid-stack>.grid-stack-item[gs-x="94"] {
  left: 94%;
}

.grid-stack>.grid-stack-item[gs-min-w="94"] {
  min-width: 94%;
}

.grid-stack>.grid-stack-item[gs-max-w="94"] {
  max-width: 94%;
}

.grid-stack>.grid-stack-item[gs-w="95"] {
  width: 95%;
}

.grid-stack>.grid-stack-item[gs-x="95"] {
  left: 95%;
}

.grid-stack>.grid-stack-item[gs-min-w="95"] {
  min-width: 95%;
}

.grid-stack>.grid-stack-item[gs-max-w="95"] {
  max-width: 95%;
}

.grid-stack>.grid-stack-item[gs-w="96"] {
  width: 96%;
}

.grid-stack>.grid-stack-item[gs-x="96"] {
  left: 96%;
}

.grid-stack>.grid-stack-item[gs-min-w="96"] {
  min-width: 96%;
}

.grid-stack>.grid-stack-item[gs-max-w="96"] {
  max-width: 96%;
}

.grid-stack>.grid-stack-item[gs-w="97"] {
  width: 97%;
}

.grid-stack>.grid-stack-item[gs-x="97"] {
  left: 97%;
}

.grid-stack>.grid-stack-item[gs-min-w="97"] {
  min-width: 97%;
}

.grid-stack>.grid-stack-item[gs-max-w="97"] {
  max-width: 97%;
}

.grid-stack>.grid-stack-item[gs-w="98"] {
  width: 98%;
}

.grid-stack>.grid-stack-item[gs-x="98"] {
  left: 98%;
}

.grid-stack>.grid-stack-item[gs-min-w="98"] {
  min-width: 98%;
}

.grid-stack>.grid-stack-item[gs-max-w="98"] {
  max-width: 98%;
}

.grid-stack>.grid-stack-item[gs-w="99"] {
  width: 99%;
}

.grid-stack>.grid-stack-item[gs-x="99"] {
  left: 99%;
}

.grid-stack>.grid-stack-item[gs-min-w="99"] {
  min-width: 99%;
}

.grid-stack>.grid-stack-item[gs-max-w="99"] {
  max-width: 99%;
}

.grid-stack>.grid-stack-item[gs-w="100"] {
  width: 100%;
}

.grid-stack>.grid-stack-item[gs-x="100"] {
  left: 100%;
}

.grid-stack>.grid-stack-item[gs-min-w="100"] {
  min-width: 100%;
}

.grid-stack>.grid-stack-item[gs-max-w="100"] {
  max-width: 100%;
} */


.grid-stack.grid-stack-1>.grid-stack-item {
  min-width: 100%;
}

.grid-stack.grid-stack-1>.grid-stack-item[gs-w="1"] {
  width: 100%;
}

.grid-stack.grid-stack-1>.grid-stack-item[gs-x="1"] {
  left: 100%;
}

.grid-stack.grid-stack-1>.grid-stack-item[gs-min-w="1"] {
  min-width: 100%;
}

.grid-stack.grid-stack-1>.grid-stack-item[gs-max-w="1"] {
  max-width: 100%;
}

.grid-stack.grid-stack-animate,
.grid-stack.grid-stack-animate .grid-stack-item {
  -webkit-transition: left 0.3s, top 0.3s, height 0.3s, width 0.3s;
  -moz-transition: left 0.3s, top 0.3s, height 0.3s, width 0.3s;
  -ms-transition: left 0.3s, top 0.3s, height 0.3s, width 0.3s;
  -o-transition: left 0.3s, top 0.3s, height 0.3s, width 0.3s;
  transition: left 0.3s, top 0.3s, height 0.3s, width 0.3s;
}

.grid-stack.grid-stack-animate .grid-stack-item.ui-draggable-dragging,
.grid-stack.grid-stack-animate .grid-stack-item.ui-resizable-resizing,
.grid-stack.grid-stack-animate .grid-stack-item.grid-stack-placeholder {
  -webkit-transition: left 0s, top 0s, height 0s, width 0s;
  -moz-transition: left 0s, top 0s, height 0s, width 0s;
  -ms-transition: left 0s, top 0s, height 0s, width 0s;
  -o-transition: left 0s, top 0s, height 0s, width 0s;
  transition: left 0s, top 0s, height 0s, width 0s;
}








/**
 * default to generate [2-11] columns as 1 (oneColumnMode) and 12 (default) are in the main css
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
 .grid-stack.grid-stack-2 > .grid-stack-item {
  min-width: 50%;
}
.grid-stack.grid-stack-2 > .grid-stack-item[gs-w="1"] {
  width: 50%;
}
.grid-stack.grid-stack-2 > .grid-stack-item[gs-x="1"] {
  left: 50%;
}
.grid-stack.grid-stack-2 > .grid-stack-item[gs-min-w="1"] {
  min-width: 50%;
}
.grid-stack.grid-stack-2 > .grid-stack-item[gs-max-w="1"] {
  max-width: 50%;
}
.grid-stack.grid-stack-2 > .grid-stack-item[gs-w="2"] {
  width: 100%;
}
.grid-stack.grid-stack-2 > .grid-stack-item[gs-x="2"] {
  left: 100%;
}
.grid-stack.grid-stack-2 > .grid-stack-item[gs-min-w="2"] {
  min-width: 100%;
}
.grid-stack.grid-stack-2 > .grid-stack-item[gs-max-w="2"] {
  max-width: 100%;
}

.grid-stack.grid-stack-3 > .grid-stack-item {
  min-width: 33.3333333333%;
}
.grid-stack.grid-stack-3 > .grid-stack-item[gs-w="1"] {
  width: 33.3333333333%;
}
.grid-stack.grid-stack-3 > .grid-stack-item[gs-x="1"] {
  left: 33.3333333333%;
}
.grid-stack.grid-stack-3 > .grid-stack-item[gs-min-w="1"] {
  min-width: 33.3333333333%;
}
.grid-stack.grid-stack-3 > .grid-stack-item[gs-max-w="1"] {
  max-width: 33.3333333333%;
}
.grid-stack.grid-stack-3 > .grid-stack-item[gs-w="2"] {
  width: 66.6666666667%;
}
.grid-stack.grid-stack-3 > .grid-stack-item[gs-x="2"] {
  left: 66.6666666667%;
}
.grid-stack.grid-stack-3 > .grid-stack-item[gs-min-w="2"] {
  min-width: 66.6666666667%;
}
.grid-stack.grid-stack-3 > .grid-stack-item[gs-max-w="2"] {
  max-width: 66.6666666667%;
}
.grid-stack.grid-stack-3 > .grid-stack-item[gs-w="3"] {
  width: 100%;
}
.grid-stack.grid-stack-3 > .grid-stack-item[gs-x="3"] {
  left: 100%;
}
.grid-stack.grid-stack-3 > .grid-stack-item[gs-min-w="3"] {
  min-width: 100%;
}
.grid-stack.grid-stack-3 > .grid-stack-item[gs-max-w="3"] {
  max-width: 100%;
}

.grid-stack.grid-stack-4 > .grid-stack-item {
  min-width: 25%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-w="1"] {
  width: 25%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-x="1"] {
  left: 25%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-min-w="1"] {
  min-width: 25%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-max-w="1"] {
  max-width: 25%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-w="2"] {
  width: 50%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-x="2"] {
  left: 50%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-min-w="2"] {
  min-width: 50%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-max-w="2"] {
  max-width: 50%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-w="3"] {
  width: 75%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-x="3"] {
  left: 75%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-min-w="3"] {
  min-width: 75%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-max-w="3"] {
  max-width: 75%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-w="4"] {
  width: 100%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-x="4"] {
  left: 100%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-min-w="4"] {
  min-width: 100%;
}
.grid-stack.grid-stack-4 > .grid-stack-item[gs-max-w="4"] {
  max-width: 100%;
}

.grid-stack.grid-stack-5 > .grid-stack-item {
  min-width: 20%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-w="1"] {
  width: 20%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-x="1"] {
  left: 20%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-min-w="1"] {
  min-width: 20%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-max-w="1"] {
  max-width: 20%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-w="2"] {
  width: 40%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-x="2"] {
  left: 40%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-min-w="2"] {
  min-width: 40%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-max-w="2"] {
  max-width: 40%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-w="3"] {
  width: 60%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-x="3"] {
  left: 60%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-min-w="3"] {
  min-width: 60%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-max-w="3"] {
  max-width: 60%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-w="4"] {
  width: 80%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-x="4"] {
  left: 80%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-min-w="4"] {
  min-width: 80%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-max-w="4"] {
  max-width: 80%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-w="5"] {
  width: 100%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-x="5"] {
  left: 100%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-min-w="5"] {
  min-width: 100%;
}
.grid-stack.grid-stack-5 > .grid-stack-item[gs-max-w="5"] {
  max-width: 100%;
}

.grid-stack.grid-stack-6 > .grid-stack-item {
  min-width: 16.6666666667%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-w="1"] {
  width: 16.6666666667%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-x="1"] {
  left: 16.6666666667%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-min-w="1"] {
  min-width: 16.6666666667%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-max-w="1"] {
  max-width: 16.6666666667%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-w="2"] {
  width: 33.3333333333%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-x="2"] {
  left: 33.3333333333%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-min-w="2"] {
  min-width: 33.3333333333%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-max-w="2"] {
  max-width: 33.3333333333%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-w="3"] {
  width: 50%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-x="3"] {
  left: 50%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-min-w="3"] {
  min-width: 50%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-max-w="3"] {
  max-width: 50%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-w="4"] {
  width: 66.6666666667%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-x="4"] {
  left: 66.6666666667%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-min-w="4"] {
  min-width: 66.6666666667%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-max-w="4"] {
  max-width: 66.6666666667%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-w="5"] {
  width: 83.3333333333%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-x="5"] {
  left: 83.3333333333%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-min-w="5"] {
  min-width: 83.3333333333%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-max-w="5"] {
  max-width: 83.3333333333%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-w="6"] {
  width: 100%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-x="6"] {
  left: 100%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-min-w="6"] {
  min-width: 100%;
}
.grid-stack.grid-stack-6 > .grid-stack-item[gs-max-w="6"] {
  max-width: 100%;
}

.grid-stack.grid-stack-7 > .grid-stack-item {
  min-width: 14.2857142857%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-w="1"] {
  width: 14.2857142857%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-x="1"] {
  left: 14.2857142857%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-min-w="1"] {
  min-width: 14.2857142857%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-max-w="1"] {
  max-width: 14.2857142857%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-w="2"] {
  width: 28.5714285714%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-x="2"] {
  left: 28.5714285714%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-min-w="2"] {
  min-width: 28.5714285714%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-max-w="2"] {
  max-width: 28.5714285714%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-w="3"] {
  width: 42.8571428571%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-x="3"] {
  left: 42.8571428571%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-min-w="3"] {
  min-width: 42.8571428571%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-max-w="3"] {
  max-width: 42.8571428571%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-w="4"] {
  width: 57.1428571429%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-x="4"] {
  left: 57.1428571429%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-min-w="4"] {
  min-width: 57.1428571429%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-max-w="4"] {
  max-width: 57.1428571429%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-w="5"] {
  width: 71.4285714286%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-x="5"] {
  left: 71.4285714286%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-min-w="5"] {
  min-width: 71.4285714286%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-max-w="5"] {
  max-width: 71.4285714286%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-w="6"] {
  width: 85.7142857143%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-x="6"] {
  left: 85.7142857143%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-min-w="6"] {
  min-width: 85.7142857143%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-max-w="6"] {
  max-width: 85.7142857143%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-w="7"] {
  width: 100%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-x="7"] {
  left: 100%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-min-w="7"] {
  min-width: 100%;
}
.grid-stack.grid-stack-7 > .grid-stack-item[gs-max-w="7"] {
  max-width: 100%;
}

.grid-stack.grid-stack-8 > .grid-stack-item {
  min-width: 12.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-w="1"] {
  width: 12.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-x="1"] {
  left: 12.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-min-w="1"] {
  min-width: 12.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-max-w="1"] {
  max-width: 12.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-w="2"] {
  width: 25%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-x="2"] {
  left: 25%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-min-w="2"] {
  min-width: 25%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-max-w="2"] {
  max-width: 25%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-w="3"] {
  width: 37.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-x="3"] {
  left: 37.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-min-w="3"] {
  min-width: 37.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-max-w="3"] {
  max-width: 37.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-w="4"] {
  width: 50%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-x="4"] {
  left: 50%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-min-w="4"] {
  min-width: 50%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-max-w="4"] {
  max-width: 50%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-w="5"] {
  width: 62.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-x="5"] {
  left: 62.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-min-w="5"] {
  min-width: 62.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-max-w="5"] {
  max-width: 62.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-w="6"] {
  width: 75%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-x="6"] {
  left: 75%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-min-w="6"] {
  min-width: 75%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-max-w="6"] {
  max-width: 75%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-w="7"] {
  width: 87.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-x="7"] {
  left: 87.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-min-w="7"] {
  min-width: 87.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-max-w="7"] {
  max-width: 87.5%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-w="8"] {
  width: 100%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-x="8"] {
  left: 100%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-min-w="8"] {
  min-width: 100%;
}
.grid-stack.grid-stack-8 > .grid-stack-item[gs-max-w="8"] {
  max-width: 100%;
}

.grid-stack.grid-stack-9 > .grid-stack-item {
  min-width: 11.1111111111%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-w="1"] {
  width: 11.1111111111%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-x="1"] {
  left: 11.1111111111%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-min-w="1"] {
  min-width: 11.1111111111%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-max-w="1"] {
  max-width: 11.1111111111%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-w="2"] {
  width: 22.2222222222%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-x="2"] {
  left: 22.2222222222%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-min-w="2"] {
  min-width: 22.2222222222%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-max-w="2"] {
  max-width: 22.2222222222%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-w="3"] {
  width: 33.3333333333%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-x="3"] {
  left: 33.3333333333%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-min-w="3"] {
  min-width: 33.3333333333%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-max-w="3"] {
  max-width: 33.3333333333%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-w="4"] {
  width: 44.4444444444%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-x="4"] {
  left: 44.4444444444%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-min-w="4"] {
  min-width: 44.4444444444%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-max-w="4"] {
  max-width: 44.4444444444%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-w="5"] {
  width: 55.5555555556%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-x="5"] {
  left: 55.5555555556%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-min-w="5"] {
  min-width: 55.5555555556%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-max-w="5"] {
  max-width: 55.5555555556%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-w="6"] {
  width: 66.6666666667%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-x="6"] {
  left: 66.6666666667%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-min-w="6"] {
  min-width: 66.6666666667%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-max-w="6"] {
  max-width: 66.6666666667%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-w="7"] {
  width: 77.7777777778%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-x="7"] {
  left: 77.7777777778%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-min-w="7"] {
  min-width: 77.7777777778%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-max-w="7"] {
  max-width: 77.7777777778%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-w="8"] {
  width: 88.8888888889%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-x="8"] {
  left: 88.8888888889%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-min-w="8"] {
  min-width: 88.8888888889%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-max-w="8"] {
  max-width: 88.8888888889%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-w="9"] {
  width: 100%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-x="9"] {
  left: 100%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-min-w="9"] {
  min-width: 100%;
}
.grid-stack.grid-stack-9 > .grid-stack-item[gs-max-w="9"] {
  max-width: 100%;
}

.grid-stack.grid-stack-10 > .grid-stack-item {
  min-width: 10%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-w="1"] {
  width: 10%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-x="1"] {
  left: 10%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-min-w="1"] {
  min-width: 10%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-max-w="1"] {
  max-width: 10%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-w="2"] {
  width: 20%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-x="2"] {
  left: 20%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-min-w="2"] {
  min-width: 20%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-max-w="2"] {
  max-width: 20%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-w="3"] {
  width: 30%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-x="3"] {
  left: 30%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-min-w="3"] {
  min-width: 30%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-max-w="3"] {
  max-width: 30%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-w="4"] {
  width: 40%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-x="4"] {
  left: 40%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-min-w="4"] {
  min-width: 40%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-max-w="4"] {
  max-width: 40%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-w="5"] {
  width: 50%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-x="5"] {
  left: 50%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-min-w="5"] {
  min-width: 50%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-max-w="5"] {
  max-width: 50%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-w="6"] {
  width: 60%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-x="6"] {
  left: 60%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-min-w="6"] {
  min-width: 60%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-max-w="6"] {
  max-width: 60%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-w="7"] {
  width: 70%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-x="7"] {
  left: 70%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-min-w="7"] {
  min-width: 70%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-max-w="7"] {
  max-width: 70%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-w="8"] {
  width: 80%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-x="8"] {
  left: 80%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-min-w="8"] {
  min-width: 80%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-max-w="8"] {
  max-width: 80%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-w="9"] {
  width: 90%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-x="9"] {
  left: 90%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-min-w="9"] {
  min-width: 90%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-max-w="9"] {
  max-width: 90%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-w="10"] {
  width: 100%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-x="10"] {
  left: 100%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-min-w="10"] {
  min-width: 100%;
}
.grid-stack.grid-stack-10 > .grid-stack-item[gs-max-w="10"] {
  max-width: 100%;
}

.grid-stack.grid-stack-11 > .grid-stack-item {
  min-width: 9.0909090909%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-w="1"] {
  width: 9.0909090909%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-x="1"] {
  left: 9.0909090909%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-min-w="1"] {
  min-width: 9.0909090909%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-max-w="1"] {
  max-width: 9.0909090909%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-w="2"] {
  width: 18.1818181818%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-x="2"] {
  left: 18.1818181818%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-min-w="2"] {
  min-width: 18.1818181818%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-max-w="2"] {
  max-width: 18.1818181818%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-w="3"] {
  width: 27.2727272727%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-x="3"] {
  left: 27.2727272727%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-min-w="3"] {
  min-width: 27.2727272727%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-max-w="3"] {
  max-width: 27.2727272727%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-w="4"] {
  width: 36.3636363636%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-x="4"] {
  left: 36.3636363636%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-min-w="4"] {
  min-width: 36.3636363636%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-max-w="4"] {
  max-width: 36.3636363636%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-w="5"] {
  width: 45.4545454545%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-x="5"] {
  left: 45.4545454545%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-min-w="5"] {
  min-width: 45.4545454545%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-max-w="5"] {
  max-width: 45.4545454545%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-w="6"] {
  width: 54.5454545455%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-x="6"] {
  left: 54.5454545455%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-min-w="6"] {
  min-width: 54.5454545455%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-max-w="6"] {
  max-width: 54.5454545455%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-w="7"] {
  width: 63.6363636364%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-x="7"] {
  left: 63.6363636364%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-min-w="7"] {
  min-width: 63.6363636364%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-max-w="7"] {
  max-width: 63.6363636364%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-w="8"] {
  width: 72.7272727273%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-x="8"] {
  left: 72.7272727273%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-min-w="8"] {
  min-width: 72.7272727273%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-max-w="8"] {
  max-width: 72.7272727273%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-w="9"] {
  width: 81.8181818182%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-x="9"] {
  left: 81.8181818182%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-min-w="9"] {
  min-width: 81.8181818182%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-max-w="9"] {
  max-width: 81.8181818182%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-w="10"] {
  width: 90.9090909091%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-x="10"] {
  left: 90.9090909091%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-min-w="10"] {
  min-width: 90.9090909091%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-max-w="10"] {
  max-width: 90.9090909091%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-w="11"] {
  width: 100%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-x="11"] {
  left: 100%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-min-w="11"] {
  min-width: 100%;
}
.grid-stack.grid-stack-11 > .grid-stack-item[gs-max-w="11"] {
  max-width: 100%;
}
</style>
