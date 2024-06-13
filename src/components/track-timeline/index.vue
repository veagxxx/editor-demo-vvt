<template>
  <div class="track-timeline-container" :style="trackStyle">
    <TrackController v-model="trackState.trackScale"></TrackController>
    <TrackList></TrackList>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { usePageState } from './stores/page-state';
import { useTrackState } from './stores/track-state';
import TrackController from './components/TrackController.vue';
import TrackList from './components/TrackList.vue';
const pageState = usePageState();
const trackState = useTrackState();
const trackStyle = computed(() => {
  return {
    height: `${pageState.trackHeight}px`,
  }
});
</script>

<style lang="scss" scoped>
  .track-timeline-container {
    position: relative;
    overflow: hidden;
    user-select: none;
    display: flex;
    flex-direction: column;
    padding-top: 8px;
    width: 800px;
    border: 1px solid #E5E7EB;
    background-color: #282828;
  }
</style>
