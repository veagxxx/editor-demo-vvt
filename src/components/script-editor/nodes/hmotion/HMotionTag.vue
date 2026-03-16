<template>
  <NodeViewWrapper as="span" class="hmotion-tag" :class="{ 'is-disabled': attrs.disabled, 'is-fun': isFunMotion }">
    <el-tooltip popper-class="sc-node-tooltip is-error" placement="top-start" effect="danger" trigger="hover" :disabled="!attrs['err-msg']" :content="attrs['err-msg']">
      <span class="tag-btn" :contenteditable="false" @click="onClick">
        <el-icon v-if="!attrs.disabled" class="preview-btn" :size="16" title="预览动作" @click.stop="onPreview">
          <svg-icon icon-class="camera-preview" />
        </el-icon>
        <span class="btn-label" :contenteditable="false">{{ displayName }}</span>
        <TagClose @click.stop="onDelete" />
      </span>
    </el-tooltip>
  </NodeViewWrapper>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { IHMotionAttrs } from '@/components/script-editor/nodes/hmotion/HMotionNode';
import TagClose from '@/components/script-editor/nodes/components/TagClose.vue';
import { ScriptEditorContextInjectKey } from '@/components/script-editor/types';

const props = defineProps(nodeViewProps);

const context = inject(ScriptEditorContextInjectKey);

const attrs = computed(() =>
{
  return props.node.attrs as IHMotionAttrs;
});

const displayName = computed(() => attrs.value.name);

const isFunMotion = computed(() => attrs.value.code.includes('_FUN_'));

function onDelete()
{
  context!.onNodeClick(props.node, {
    action: 'delete'
  });
  props.deleteNode();
}

function onClick()
{
  context!.onNodeClick(props.node);
}

function onPreview()
{
  context!.onNodeClick(props.node, {
    action: 'preview'
  });
}
</script>

<style lang="scss" scoped>
@use "../common.scss";

$bg-color: #ffda93;
.hmotion-tag {
  @include common.generate-tag-button($bg-color);
  &.is-fun {
    color: #fff !important;
    background: linear-gradient(92deg, #4b69ff 0%, #6239e9 100%) !important;
    :deep(.tag-close) {
      color: #fff;
    }
  }

  margin: 0 3px;
  &.is-disabled {
    opacity: 0.5;
    text-decoration: line-through;
  }
  .tag-btn {
    user-select: none;
    .btn-label {
      user-select: none;
    }
    .preview-btn {
      user-select: none;
      transition: transform 0.2s;
      margin-right: 5px;
      top: 4px;
      &:hover {
        transform: scale(1.1);
      }
    }
  }
}
</style>
