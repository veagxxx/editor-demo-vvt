<template>
  <NodeViewWrapper 
    as="span" 
    class="segment-node" 
    :class="{ 
      'is-hover': node.attrs.isHover, 
      [className]: true 
    }"
  >
    <span 
      v-if="displayNodeText"
      class="segment-node__content" 
      @mouseenter="toggleHoverStatus(true)" 
      @mouseleave="toggleHoverStatus(false)" 
      @click="onSegmentNodeClick"
    > 
      {{ displayNodeText }}
    </span>
    <svg-icon iconClass="close" @click="onCloseClick"></svg-icon>
  </NodeViewWrapper>
</template>
<script lang="ts" setup>
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { computed, inject, onMounted, onUpdated } from 'vue';
import { IHMotion, EditorToolbarRef, SegmentNodeType } from './types';
import { EditorToolbarInstance } from './editor.enum';
import { SegmentMap } from './constants';

const toolbarInstance = inject(EditorToolbarInstance) as EditorToolbarRef;

const props = defineProps(nodeViewProps);

const displayNodeText = computed(() => {
  const code = props.node.attrs.code as keyof typeof SegmentMap;
  return SegmentMap[code];
});

const className = computed(() => {
  return props.node.attrs.class;
});

onMounted(() => {
  deleteNodeWhenNonText();
});

onUpdated(() => {
  deleteNodeWhenNonText();
});

// 删除空文本节点
function deleteNodeWhenNonText()
{
  if (!displayNodeText.value) {
    props.deleteNode();
  }
}

function toggleHoverStatus(hovering: boolean)
{
  props.updateAttributes({
    isHover: hovering
  });
}

function updateSegmentAttrs(motion: IHMotion)
{
  props.updateAttributes({
    duration: motion.duration,
    text: motion.text,
    code: motion.code
  });
}

function onSegmentNodeClick()
{
  if (toolbarInstance && toolbarInstance.value) {
    const motion: IHMotion = { 
      duration: props.node.attrs.duration, 
      code: props.node.attrs.code 
    };
    const nodeName = props.extension.name as SegmentNodeType;
    toolbarInstance.value.openSegmentPanel(nodeName, motion, updateSegmentAttrs);
  }
}

function onCloseClick()
{
  props.deleteNode();
}
</script>
<style lang="scss" scoped>
  .segment-node {
    display: inline-flex;
    align-items: center;
    background-color: rgb(7, 197, 120);
    padding: 0 4px;
    margin: 0 4px;
    border-radius: 4px;
    user-select: none;
    gap: 2px;
    line-height: 1.5;
    font-size: 14px;
    color: #fff;
    &.hmotion-node {
      color: #000;
      background-color: #fadfb8;
      svg:hover {
        color: #8f8f8f;
      }
    }
    &.camera-node {
      background-color: #626aef;
      svg {
        color: #dbdbdb;
        &:hover {
          color: #fff;
        }
      }
    }
    &:hover {
      cursor: pointer;
    }
  }
</style>
