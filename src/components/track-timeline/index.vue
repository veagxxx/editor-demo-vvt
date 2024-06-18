<template>
  <div class="track-timeline-container" :style="trackStyle">
    <TrackController v-model="trackState.trackScale"></TrackController>
    <TrackList></TrackList>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, PropType } from 'vue';
import { usePageState } from './stores/page-state';
import { useTrackState } from './stores/track-state';
import TrackController from './components/TrackController.vue';
import TrackList from './components/TrackList.vue';
import { ITimeline } from './types';
import globalDefault from './global-default';

const props = defineProps({
  trackList: {
    type: Array as PropType<ITimeline[]>,
    default: () => [],
  }
});

const pageState = usePageState();
const trackState = useTrackState();
const trackStyle = computed(() => {
  return {
    height: `${pageState.trackHeight}px`,
  }
});

function formatComponentTrackList()
{
  return props.trackList.map(track => {
    return {
      ...track,
      trackClips: track.trackClips.map(item => {
        const fps = item.fps || globalDefault.track.fps;
        const pointList = item.mediaURL.split('.');
        const format = pointList[pointList.length - 1];
        const frameCount = Math.round((item.duration || 0) * fps);
        const inFrame = Math.round((item.in || 0) * fps);
        const outFrame = Math.round((item.out || item.duration || 0) * fps);
        return {
          ...item,
          name: item.name,
          format,
          frameCount,
          inFrame,
          outFrame,
          offsetLeft: 0,
          offsetRight: 0,
        }
      })
    }
  });
}

onMounted(async () => {
  const trackList = formatComponentTrackList();
  console.log('res', trackList);
  trackState.setTrackList(trackList);
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
    width: 90vw;
    border: 1px solid #E5E7EB;
    background-color: #282828;
  }
</style>
