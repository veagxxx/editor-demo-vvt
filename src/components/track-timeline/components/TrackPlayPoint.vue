<template>
  <div class="track-play-point" :style="trackStyle">
    <span class="playpoint"></span>
  </div>
</template>

<script setup lang="ts">
  import { getGridPixel } from '../utils/canvas';
  import { computed } from 'vue';
  import { useTrackState } from '../stores/track-state';
  import { usePlayerState } from '../stores/player-state';
  const offsetLine = {
    left: 10
  };
  const trackStore = useTrackState();
  const playStore = usePlayerState();
  const trackStyle = computed(() => {
    return {
      left: `${offsetLine.left}px`,
      transform: `translate(${getGridPixel(trackStore.trackScale, playStore.playStartFrame)}px, 0px)`
    };
  });
</script>

<style lang="scss" scoped>
  .track-play-point {
    z-index: 30;
    width: 1px;
    position: absolute;
    top: -20px;
    bottom: 0px;
    background-color: #00dfb0;
    transition-property: transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 75ms;
    .playpoint {
      transform: translateX(-50%);
      display: block;
      border: 1px solid #00dfb0;
      background-color: #00dfb0;
      width: 10px;
      height: 12px;
      position: sticky;
      top: 0px;
      right: 0px;
      left: 0px;
    }
    .playpoint::after{
      content: '';
      display: block;
      width: 0px;
      height: 0px;
      border: 5px solid #00dfb0;
      position: absolute;
      top: 100%;
      left: -1px;
      border-right-color: transparent;
      border-left-color: transparent;
      border-bottom-color: transparent;
    }
  }
</style>
