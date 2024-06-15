<template>
  <div class="video-clip-container">
    <div class="video-clip-info">
      <el-icon style="display: inline-block; margin-right: 8px; flex-shrink: 0;">
        <svg-icon icon-class="video"></svg-icon>
      </el-icon>
      <span>{{ `${trackItem.name}.${trackItem.format}` }}</span>
      <span>{{ trackItem.time }}</span>
    </div>
    <div ref="container" class="video-clip-wrapper">
      <VideoFrame type="video" :trackItem="trackItem" :drawState="!loading" />
    </div>
    <div class="video-clip-image">
      <img 
        v-show="waveFileUrl" 
        :src="waveFileUrl" 
        :style="waveStyle" 
        alt=""
      />
    </div>
    <Loading v-show="loading" class="loading-container" />
  </div>
</template>

<script setup lang="ts">
import VideoFrame from './VideoFrame.vue';
import Loading from '../Loading.vue';
import type { PropType } from 'vue';
import type { VideoTractItem } from '@/components/track-timeline/stores/track-state';
import type FFmpegManager from '@/components/track-timeline/utils/ffmpeg-manager';
import { usePlayerState } from '@/components/track-timeline/stores/player-state';
import trackCheckPlaying from './track-check-playing';
import { computed, inject, ref, watch } from 'vue';
const props = defineProps({
  trackItem: {
    type: Object as PropType<VideoTractItem>,
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
const waveFileUrl = ref('');
const waveStyle = computed(() => {
  const { start, end, offsetL, offsetR, frameCount } = props.trackItem;
  const showFrameCount = end - start;
  return {
    transform: `scaleX(${(frameCount / showFrameCount).toFixed(2)})`,
    transformOrigin: 'left top',
    left: `-${offsetL / showFrameCount * 100}%`,
    right: `-${offsetR / showFrameCount * 100}%`
  };
});
async function initVideo() {
  const { name, source, format, frameCount, width, height } = props.trackItem;
  if (name && source && ffmpeg.isLoaded.value) {
    const videoName = `${name}.${format}`;
    // 写文件
    await ffmpeg.writeFile(ffmpeg.pathConfig.resourcePath, videoName, source);
    // 分离音频
    await ffmpeg.splitAudio(name, format);
    // 视频抽帧
    await ffmpeg.genFrame(name, format, {
      w: width,
      h: height
    });
    await ffmpeg.genWave(name, frameCount);
    waveFileUrl.value = await ffmpeg.getWavePng(name);
    loading.value = false;
    store.ingLoadingCount--;
  }
}
watch(() => {
  return props.trackItem.source && ffmpeg.isLoaded.value;
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
    .video-clip-info {
      display: flex;
      align-items: center;
      padding-left: 8px;
      font-size: 12px;
      height: 20px;
      line-height: 20px;
      color: rgb(229 231 235);
      background-color: rgb(107, 114, 128, 0.4);
      overflow: hidden;
      span {
        margin-right: 16px;
        flex-shrink: 0;
      }
    }
    .video-clip-wrapper {
      position: relative;
      overflow: hidden;
      background-color: rgba(107, 114, 128, 0.7);
      flex: 1;
    }
    .video-clip-image {
      position: relative;
      height: 12px;
      line-height: 12px;
      padding-left: 8px;
      overflow: hidden;
      background-color: rgb(55, 65, 81);
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
