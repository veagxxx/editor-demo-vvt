<template>
  <NodeViewWrapper as="span" class="break-tag" :class="{ 'is-disabled': attrs.disabled }" @click="onClick">
    <el-tooltip popper-class="sc-node-tooltip is-error" placement="top-start" effect="danger" trigger="click" :disabled="!attrs['err-msg']" :content="attrs['err-msg']">
      <span class="tag-btn" :contenteditable="false">
        <span class="btn-label" :contenteditable="false">{{ attrs.time }}</span>
        <TagClose @click.stop="onDelete" />
      </span>
    </el-tooltip>
  </NodeViewWrapper>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { IBreakNodeAttrs } from '@/components/script-editor/nodes/break/BreakNode';
import TagClose from '@/components/script-editor/nodes/components/TagClose.vue';
import { ScriptEditorContextInjectKey } from '@/components/script-editor/types';

const props = defineProps(nodeViewProps);

const context = inject(ScriptEditorContextInjectKey);

const attrs = computed(() =>
{
  return props.node.attrs as IBreakNodeAttrs;
});

function onDelete()
{
  props.deleteNode();
}

function onClick()
{
  context!.onNodeClick(props.node);
}
</script>

<style lang="scss" scoped>
@use "../common.scss";

$bg-color: #ace6ff;
.break-tag {
  @include common.generate-tag-button($bg-color);

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
  }
}
</style>
