<template>
  <NodeViewWrapper as="span" class="camera-tag" :class="{ 'is-disabled': attrs.disabled }">
    <NodeViewContent as="span" />
    <el-tooltip popper-class="sc-node-tooltip is-error" placement="top-start" effect="danger" trigger="hover" :disabled="!attrs['err-msg']" :content="attrs['err-msg']">
      <span class="tag-btn" :contenteditable="false" @click="onClick">
        <el-icon v-if="!attrs.disabled" class="preview-btn" :size="16" title="预览镜头" @click.stop="onPreview">
          <svg-icon icon-class="camera-preview" />
        </el-icon>
        <span :contenteditable="false" class="btn-label" @paste="handlePaste">{{ displayName }}</span>
        <TagClose @click.stop="onDelete" />
      </span>
    </el-tooltip>
  </NodeViewWrapper>
</template>

<script lang="ts" setup>
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { computed, inject, watch } from 'vue';
import { ICameraAttrs } from '@/components/script-editor/nodes/camera/CameraNode';
import TagClose from '@/components/script-editor/nodes/components/TagClose.vue';
import { ScriptEditorContextInjectKey } from '@/components/script-editor/types';

const props = defineProps(nodeViewProps);

const context = inject(ScriptEditorContextInjectKey);

const attrs = computed(() =>
{
  return props.node.attrs as ICameraAttrs;
});

watch(() => props.node.textContent, (textContent) =>
{
  // console.log('watch nodeSize', textContent, props.node);
  // 如果没有内容，删除节点
  if (!textContent && props.node.childCount === 0)
  {
    props.deleteNode();
  }
});

function handlePaste(event: ClipboardEvent)
{
  // 屏蔽粘贴功能，避免用户粘贴图片内容
  event.preventDefault();
}

// console.log('CameraTag attrs:', attrs.value, props);

const displayName = computed(() => attrs.value.name);

function onDelete()
{
  // camera 标签需要删除对应的 camera 节点的同时重新插入包含的文本内容
  const { attrs } = props.node;
  props.editor.commands.deleteCameraNode(attrs.id);
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

$bg-color: #ccffbf;
.camera-tag {
  border-bottom: 1px solid rgba($bg-color, 0.8);
  margin-right: 3px;
  &.is-disabled {
    text-decoration: line-through;
    opacity: 0.5;
    .tag-btn .btn-label {
      text-decoration: line-through;
    }
  }
  .tag-btn {
    user-select: none;
    @include common.generate-tag-button($bg-color);
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
