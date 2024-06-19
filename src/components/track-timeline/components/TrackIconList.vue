<template>
  <div ref="iconList" class="trackiconlist">
    <span class="top-placeholder"></span>
    <div class="iconlist-wrapper">
      <template v-for="(lineData, _) of listData" :key="lineData.type + _">
        <div 
          class="icon-item" 
          :class="{ 'is-main': lineData.mainTrack }" 
          :style="{ height: TrackHeightMap.get(lineData.type) + 'px' }" 
          :title="lineData.mainTrack ? '主轨道' : ''"
        >
          <el-icon>
            <svg-icon :icon-class="iconMap.get(lineData.type) || ''"></svg-icon>
          </el-icon>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, watch } from 'vue';
import { TrackHeightMap } from '../data/track-config';
import { ITimelineInComponent } from '../types';
const props = defineProps({
  listData: {
    type: Array as PropType<ITimelineInComponent[]>,
    default() {
      return [];
    }
  },
  offsetTop: {
    type: Number,
    default: 0
  }
});
const iconMap = new Map([
  ['video', 'video'],
  ['audio', 'audio'],
  ['text', 'text'],
  ['image', 'image'],
  ['effect', 'effect'],
]);
const iconList = ref();
watch(() => props.offsetTop, () => {
  iconList.value.scrollTop = props.offsetTop;
});
</script>
<style lang="scss" scoped>
  .trackiconlist {
    position: relative;
    width: 48px;
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    overflow-y: hidden;
    overflow-x: scroll;
    border-right: 1px solid;
    border-color:  rgb(75 85 99);
    .top-placeholder {
      width: 100%;
      height: 20px;
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      z-index: 20;
      background-color: #282828;
    }
    .iconlist-wrapper {
      position: absolute;
      padding-top: 40px;
      padding-bottom: 20px;
      min-width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow-x: hidden;
      left: 0;
      right: 0;
      .icon-item {
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 48px;
        text-align: center;
        margin-bottom: 4px;
        margin-top: 4px;
        color: #b4b4b4;
        &.is-main {
          background-color: #3c3c3c;
        }
      }
    }
  }
</style>