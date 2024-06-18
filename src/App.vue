<script setup lang="ts">
// import EditorSegment from './components/editor-segment/index.vue';
import TrackTimeline from './components/track-timeline/index.vue';
import { ITimeline } from './components/track-timeline/types';
// import { ref } from 'vue';
// const content = ref('<speak volume="50" rate="0">朋友们&lt;&gt;你们好，今&amp;天，我来带<hmotion duration="2" code="man001_indicate_low_right"></hmotion>大家一起欢迎走进木结构建筑的世界。</speak>');
const mockTimeline: ITimeline[] = [
  {
    type: 'video',
    mainTrack: true,
    trackClips: [
      {
        id: 't-5f711984-9383',
        name: '测试视频.mp4',
        type: 'video',
        mediaId: 't-5f711984-9383',
        mediaURL: '/video/video_1.mp4',
        in: 0,
        out: 23.733,
        duration: 23.733,
        fps: 30,
        width: 1232,
        height: 720,
      },
    ]
  },
  {
    type: 'audio',
    trackClips: [
      {
        id: 't-8cfc2b04-cde2',
        type: 'audio',
        name: '测试音频1',
        mediaId: 't-8cfc2b04-cde2',
        mediaURL: '/audio/audio_0.mp3',
        in: 0,
        out: 25,
        duration: 25,
      }
    ]
  }
]
</script>

<template>
  <!-- <editor-segment v-model="content"></editor-segment> -->
  <TrackTimeline :track-list="mockTimeline"></TrackTimeline>
</template>

<style scoped></style>
