<template>
  <div class="audio-clip-container">
    <div class="audio-clip-image">
      <img :src="waveFileUrl" v-show="waveFileUrl" :style="waveStyle" alt="">
    </div>
    <Loading v-show="loading" class="loading-container" />
  </div>
</template>

<script setup lang="ts">
import Loading from '../Loading.vue';
import type { PropType } from 'vue';
import type FFmpegManager from '@/components/track-timeline/utils/ffmpeg-manager';
import { usePlayerState } from '@/components/track-timeline/stores/player-state';
import trackCheckPlaying from './track-check-playing';
import { computed, inject, ref, watch } from 'vue';
import { ITrackClipInComponent } from '@/components/track-timeline/types';
const props = defineProps({
  trackItem: {
    type: Object as PropType<ITrackClipInComponent>,
    default() {
      return {
        showWidth: '0px',
        showLeft: '0px'
      };
    }
  }
});
const store = usePlayerState();
store.ingLoadingCount++;
const waveStyle = computed(() => {
  const { inFrame, outFrame, offsetLeft, offsetRight, frameCount } = props.trackItem;
  const showFrameCount = outFrame - inFrame;
  return {
    transform: `scaleX(${(frameCount / showFrameCount).toFixed(2)})`,
    transformOrigin: 'left top',
    left: `-${offsetLeft / showFrameCount * 100}%`,
    right: `-${offsetRight / showFrameCount * 100}%`
  };
});
const ffmpeg = inject('ffmpeg') as FFmpegManager;
const loading = ref(true);
const waveFileUrl = ref('');
async function initAudio() {
  const { name, mediaURL, format, frameCount } = props.trackItem;
  if (name && mediaURL && ffmpeg.isLoaded.value) {
    const audioName = `${name}.${format}`;
    // 写文件
    await ffmpeg.writeFile(ffmpeg.pathConfig.resourcePath, audioName, mediaURL);
    await ffmpeg.genWave(name, frameCount, format);
    waveFileUrl.value = await ffmpeg.getWavePng(name);
    loading.value = false;
    store.ingLoadingCount--;
  }
}
watch(() => {
  return props.trackItem.mediaURL && ffmpeg.isLoaded.value;
}, initAudio, {
  immediate: true,
});
trackCheckPlaying(props);
</script>
<style lang="scss" scoped>
  .audio-clip-container {
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    overflow: hidden;
    height: 100%;
    .audio-clip-image {
      position: relative;
      flex: 1;
      padding-left: 8px;
      overflow: hidden;
      background-color: #1f4d43;
      img {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        min-width: 100%;
        height: 100%;
      }
    }
    .loading-container {
      padding-left: 48px;
    }
  }
</style>
