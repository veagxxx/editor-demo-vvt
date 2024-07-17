<script setup lang="ts">
import { ref } from 'vue';
import { ZMessageBox } from './components/message-box';
import EditorSegment from './components/editor-segment/index.vue';
import { h } from 'vue';
// import TrackTimeline from './components/track-timeline/index.vue';
// import { ITimeline } from './components/track-timeline/types';

const content = ref('<speak volume="50" rate="0">朋友们&lt;&gt;你们好，今&amp;天，我来带<hmotion duration="2" code="man001_indicate_low_right"></hmotion>大家一起欢迎走进木结构建筑的世界。</speak>');

function onTest()
{
  ZMessageBox({
    title: '提示',
    type: 'warning',
    boxType: 'alert',
    showCancelButton: false,
    showConfirmButton: false,
    message: h('span', { style: { color: 'var(--el-color-primary)' } }, 'hello world'),
    beforeClose: (action, vm, done) => {
      console.log('before close', action, vm, done);
      done();
    },
    footers: [{
      buttonText: '取消',
      action: 'cancel'
    }, {
      buttonText: '确认',
      action: 'confirm'
    }, {
      buttonText: '自定义',
      buttonType: 'primary',
      onClick: (e, done) => {
        console.log('confirm', e);
        done();
      },
    }],
  })
  .then(() => {
    console.log('then');
  })
  .catch(() => {
    console.log('catch');
  });
}
</script>

<template>
  <el-button @click="onTest">测试</el-button>
  <editor-segment v-model="content"></editor-segment>
</template>

<style scoped></style>
