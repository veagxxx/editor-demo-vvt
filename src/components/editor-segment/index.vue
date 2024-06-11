<template>
  <div class="editor-segment-layout">
    <editor-toolbar ref="editorToolBarRef" v-bind="{ editor, output }"></editor-toolbar>
    <editor-content class="editor-segment" :editor="editor" />
  </div>
</template>

<script lang="ts" setup>
import { EditorContent, Editor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { 
  PauseNode,
  SpeakNode,
  NoEnterExtension,
  createSegmentNode,
} from './extensions.ts';
import { computed, onBeforeUnmount, onMounted, PropType, provide, ref } from 'vue';
import EditorToolbar from './EditorToolbar.vue';
import { NodeName, SegmentTag, EditorToolbarInstance } from './editor.enum.ts';
import { Output } from './types.ts';

const props = defineProps({
  modelValue: {
    type: String as PropType<string>,
    require: true,
  },
  // 输出 xml / 纯文本
  output: {
    type: String as PropType<Output>,
    default: 'xml'
  },
});

const emit = defineEmits(['update:modelValue']);

const editor = ref<Editor>();
const editorToolBarRef = ref<InstanceType<typeof EditorToolbar>>();

provide(EditorToolbarInstance, editorToolBarRef);

const displayValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emitChange(value || '');
  }
});

onMounted(initEditor);

onBeforeUnmount(() => {
  editor.value?.off('update');
  editor.value?.destroy();
});

function initEditor()
{
  editor.value = new Editor({
    content: displayValue.value,
    extensions: [
      StarterKit,
      SpeakNode,
      PauseNode,
      createSegmentNode({
        name: NodeName.Motion,
        tag: SegmentTag.Motion,
      }),
      createSegmentNode({
        name: NodeName.Camera,
        tag: SegmentTag.Camera,
      }),
      NoEnterExtension,
    ],
    onUpdate({ editor }) {
      if (props.output === 'xml')
      {
        emitChange(editor.getHTML());
      }
      else
      {
        emitChange(editor.getText());
      }
    },
  });
}

function emitChange(value: string)
{
  emit('update:modelValue', value);
}

// function transtorm2HTML()
// {
//   return editor.value?.getHTML();
// }

// defineExpose({
//   getHTML: transtorm2HTML
// });
</script>
<style lang="scss">
  .editor-segment-layout {
    width: 600px;
    height: 200px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    .editor-segment__toolbar {
      width: 100%;
      height: 32px;
      display: flex;
      justify-content: flex-start;
    }
    .editor-segment {
      width: 100%;
      flex: 1;
      overflow: hidden;
      text-align: left;
      border: 1px solid var(--el-color-primary-light-7);
      border-radius: 8px;
      padding: 8px;
      font-size: 14px;
      transition: border .3s;
      box-sizing: border-box;
      &:has(.tiptap:focus) {
        border-color: var(--el-color-primary);
      }
    }
    .editor-segment .tiptap {
      width: 100%;
      height: 100%;
      outline: none;
      overflow-y: auto;
    }
    .editor-segment:has(.is-hover) {
      color: rgb(179, 179, 179);
      .pause-node, .hmotion-node, .camera-node {
        &:not(.is-hover) {
          opacity: 0.3;
        }
      }
      svg {
        cursor: pointer;
      }
    }
  }
</style>
