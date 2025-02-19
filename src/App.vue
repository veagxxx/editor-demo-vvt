<script setup lang="ts">
import { ref } from 'vue';
import EditorSegment from './components/editor-segment/index.vue';
import DictSelect from './components/dict-select';
const content = ref('<speak volume="50" rate="0">朋友们&lt;&gt;你们好，今&amp;天，我来带<hmotion duration="2" code="man001_indicate_low_right"></hmotion>大家一起欢迎走进木结构建筑的世界。</speak>');
</script>

<template>
  <editor-segment v-model="content"></editor-segment>
  <DictSelect.SceneSelect></DictSelect.SceneSelect>
</template>

<style scoped>
  .btn-wrapper {
    position: absolute;
    top: 50px;
    left: 50px;
  }
</style>
