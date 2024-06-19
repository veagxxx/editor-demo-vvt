<template>
  <div class="video-clip-container">
    <div ref="container" class="video-clip-wrapper">
      <VideoFrame type="video" :trackItem="trackItem" :nonLoading="!loading" />
    </div>
    <Loading v-show="loading" class="loading-container" />
  </div>
</template>

<script setup lang="ts">
import VideoFrame from './VideoFrame.vue';
import Loading from '../Loading.vue';
import type { PropType } from 'vue';
import type FFmpegManager from '@/components/track-timeline/utils/ffmpeg-manager';
import { usePlayerState } from '@/components/track-timeline/stores/player-state';
import trackCheckPlaying from './track-check-playing';
import { inject, ref, watch } from 'vue';
import { ITrackClipInComponent } from '../../types';
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
const container = ref();
const ffmpeg = inject('ffmpeg') as FFmpegManager;
const loading = ref(true);

async function initVideo() {
  const { name, mediaURL, format, width = 0, height = 0 } = props.trackItem;
  if (name && mediaURL && ffmpeg.isLoaded.value) {
    const videoName = `${name}.${format}`;
    // 写文件
    await ffmpeg.writeFile(ffmpeg.pathConfig.resourcePath, videoName, mediaURL);
    // 分离音频
    await ffmpeg.splitAudio(name, format);
    // 视频抽帧
    await ffmpeg.genFrame(name, format, {
      w: width,
      h: height
    });
    loading.value = false;
    store.ingLoadingCount--;
  }
}
watch(() => {
  return props.trackItem.mediaURL && ffmpeg.isLoaded.value;
}, initVideo, {
  immediate: true,
  flush: 'post'
});
trackCheckPlaying(props);
</script>
<style lang="scss" scoped>
  .video-clip-container {
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    overflow: hidden;
    height: 100%;
    &:hover {
      cursor: pointer;
    }
    .video-clip-wrapper {
      position: relative;
      overflow: hidden;
      background-color: rgba(107, 114, 128, 0.7);
      flex: 1;
    }
    .loading-container {
      padding-left: 48px;
    }
  }
</style>
