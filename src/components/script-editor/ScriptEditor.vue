<template>
  <div class="script-editor" :class="{ 'is-disabled': props.disabled, 'is-uneditable': !props.editable }">
    <EditorContent v-if="editor" class="editor-content" :editor="editor" />
  </div>
</template>

<script lang="ts" setup>
import { Editor, EditorContent } from '@tiptap/vue-3';
import { onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue';
import {
  IScriptEditorContext,
  NodeInst,
  ScriptEditorContextInjectKey, SelectionRange
} from '@/components/script-editor/types';
import { useScriptEditor } from '@/components/script-editor/hooks/useScriptEditor';
import { extensions } from '@/components/script-editor/index';

interface IProps
{
  modelValue: string;
  disabled?: boolean;
  editable?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  disabled: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'selectionRangeUpdate', range: SelectionRange): void;
  (e: 'nodeSelected', node: NodeInst, options?: Record<string, any>): void;
  (e: 'blur'): void;
}>();

const content = ref('');
const editor = ref<InstanceType<typeof Editor>>();

const {
  canInsertCameraNode,
  canInsertBreakNode,
  canInsertHMotionNode,
  insertCameraNode,
  insertHMotionNode,
  insertBreakNode,
  updateSpeakNode,
  updateHMotionNode,
  updateCameraNode,
  updateBreakNode,
  getSurroundingText,
  getSelectedText,
  setSelectionRange,
  focus
} = useScriptEditor(editor);

watch(() => props.editable, (val) =>
{
  editor.value?.setOptions({
    editable: val
  });
});
const data = reactive<IScriptEditorContext>({

  onNodeClick: (node, options) =>
  {
    console.log('[click]', node, options);
    emit('nodeSelected', node, options);
  }
});

provide(ScriptEditorContextInjectKey, data);

watch(() => props.modelValue, (value) =>
{
  // console.log('[modelValue Update]\n', value);
  // 如果内容不一致，则更新编辑器内容，否则如果每次更新会导致光标位置跑到文本末尾
  if (content.value !== value)
  {
    // 替换 &nbsp; 为普通的空格 " "，解决文案翻译为英文后，返回的文本中包含 &nbsp; 导致的动作和镜头节点插入后自动换行问题
    content.value = value.replace(/&nbsp;/g, ' ');
    // console.log('[modelValue Update]\n', value, '\n', content.value);
    editor.value!.commands.setContent(content.value);
  }
});

onMounted(() =>
{
  editor.value = new Editor({
    content: props.modelValue,
    editorProps: {
      attributes: {
        class: 'editor-core'
      }
    },
    editable: props.editable,
    extensions: [
      ...extensions
    ]
  });
  addEditorEventListeners();
});

onBeforeUnmount(() =>
{
  removeEditorEventListeners();
  editor.value?.destroy();
});

function addEditorEventListeners()
{
  editor.value!.on('update', () =>
  {
    // console.log('[Update]\n', editor.value?.getHTML());
    // 记录到局部变量中
    content.value = editor.value?.getHTML() || '';
    // 更新父组件的 modelValue
    emit('update:modelValue', content.value);
    // console.log('[Text]\n', editor.value?.getText());
  });

  // editor.value!.on('transaction', ({ transaction }) =>
  // {
  //   console.log('[Transaction] ----- start', transaction);
  //   console.log('Transaction steps:', transaction.steps);
  //   console.log('Selection before transaction:', transaction.selectionSet);
  //   console.log('Selection after transaction:', transaction.selection);
  //   console.log('[Transaction] ----- end');
  // });

  editor.value!.on('selectionUpdate', ({ editor }) =>
  {
    // console.log('[Selection updated]', editor.state.selection);
    const { from, to } = editor.state.selection;
    emit('selectionRangeUpdate', { from, to });
  });

  editor.value!.on('focus', () =>
  {
    console.log('[Editor Focus]');
  });

  editor.value!.on('blur', () =>
  {
    console.log('[Editor Blur]');
    emit('blur');
  });
}

function removeEditorEventListeners()
{
  editor.value!.off('update');
  editor.value!.off('transaction');
  editor.value!.off('selectionUpdate');
  editor.value!.off('focus');
  editor.value!.off('blur');
}

defineExpose({
  canInsertCameraNode,
  canInsertBreakNode,
  canInsertHMotionNode,
  insertCameraNode,
  insertHMotionNode,
  insertBreakNode,
  updateSpeakNode,
  updateHMotionNode,
  updateCameraNode,
  updateBreakNode,
  getSurroundingText,
  getSelectedText,
  setSelectionRange,
  focus
});
</script>

<style lang="scss">
@import "./nodes/public.scss";
</style>

<style lang="scss" scoped>
.script-editor {
  width: 100%;
  height: 100%;
  &.is-disabled {
    pointer-events: none;
    opacity: 0.5;
  }
  &.is-uneditable {
    :deep(.editor-core >*) {
      pointer-events: none;
      user-select: none;
    }
  }
  .editor-content {
    width: 100%;
    height: 100%;
    text-align: left;
    overflow: hidden;
    border: 1px solid var(--el-color-primary-light-7);
    border-radius: 6px;
    background-color: #fff;
    padding: 8px;
    font-size: 14px;
    transition: border 0.3s;
    box-sizing: border-box;
    &:has(.tiptap:focus) {
      border-color: var(--el-color-primary);
    }
    :deep(.tiptap) {
      width: 100%;
      height: 100%;
      letter-spacing: 1px;
      outline: none;
      line-height: 24px;
      overflow-wrap: break-word;
      overflow-y: scroll;
      p {
        margin: 0 !important;
      }
    }
  }
}
</style>
