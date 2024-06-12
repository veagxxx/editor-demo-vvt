<template>
  <NodeViewWrapper as="span" class="pause-node" :class="{ 'is-hover': node.attrs.isHover }">
    <PauseTooltip :time="displaySeconds" @pickPauseTime="onPauseTimeChange" @remove-time="onClose">
      <span 
        v-if="displaySeconds"
        class="pause-node__wrapper"
        @mouseenter="toggleHoverStatus(true)"
        @mouseleave="toggleHoverStatus(false)"
      >
        <span class="pause-node__content--text">{{ displaySeconds }}s</span>
        <svg-icon iconClass="close" @click="onClose"></svg-icon>
      </span>
    </PauseTooltip>
  </NodeViewWrapper>
</template>
<script lang="ts" setup>
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { computed } from 'vue';
import PauseTooltip from './PauseTooltip.vue';
const props = defineProps(nodeViewProps);

const displaySeconds = computed(() => {
  const seconds = props.node.attrs.time;
  return seconds ? seconds : '';
});

function onClose() {
  props.deleteNode();
}
function toggleHoverStatus(hovering: boolean)
{
  props.updateAttributes({
    isHover: hovering
  });
}
function onPauseTimeChange(time: number) 
{
  props.updateAttributes({ time });
}
</script>
<style lang="scss" scoped>
  .pause-node {
    font-size: 14px;
    margin: 0 4px;
    &.is-hover {
      .pause-node__wrapper {
        background-color: #04a363;
      }
    }
  }
  .pause-node__wrapper {
    display: inline-flex;
    align-items: center;
    background-color: rgb(7, 197, 120);
    padding: 0 2px;
    border-radius: 4px;
    user-select: none;
    gap: 2px;
    line-height: 1.5;
    .pause-node__content--text {
      color: #fff;
    }
    svg {
      color: #dbdbdb;
      &:hover {
        color: #fff;
      }
    }
  }

</style>
