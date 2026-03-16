import { computed, Ref } from 'vue';
import { Editor } from '@tiptap/vue-3';
import { ICameraAttrs } from '../nodes/camera/CameraNode';
import { IHMotionAttrs } from '../nodes/hmotion/HMotionNode';
import { IBreakNodeAttrs } from '../nodes/break/BreakNode';
import { ISpeakAttrs } from '../nodes/speak/SpeakNode';
import { SelectionRange } from '@/components/script-editor/types';

export function useScriptEditor(editor: Ref<Editor | undefined>)
{
  // 定义计算属性来判断是否可以插入 Camera 节点
  const canInsertCameraNode = computed(() =>
  {
    if (!editor.value)
    {
      return false;
    }

    // 使用 editor.can() 判断是否可以插入 Camera 节点
    return editor.value.can().insertCameraNode();
  });

  // 定义计算属性来判断是否可以插入 Break 节点
  const canInsertBreakNode = computed(() =>
  {
    if (!editor.value)
    {
      return false;
    }

    // 使用 editor.can() 判断是否可以插入 Camera 节点
    return editor.value.can().insertBreakNode();
  });

  const canInsertHMotionNode = computed(() =>
  {
    if (!editor.value)
    {
      return false;
    }

    // 使用 editor.can() 判断是否可以插入 Camera 节点
    return editor.value.can().insertHMotionNode();
  });

  const insertCameraNode = (attrs: ICameraAttrs) =>
  {
    editor.value!.commands.insertCameraNode(attrs);
  };

  const insertHMotionNode = (attrs: IHMotionAttrs) =>
  {
    editor.value!.commands.insertHMotionNode(attrs);
  };

  const insertBreakNode = (attrs: IBreakNodeAttrs) =>
  {
    editor.value!.commands.insertBreakNode(attrs);
  };

  const updateSpeakNode = (attrs: Partial<ISpeakAttrs>) =>
  {
    editor.value!.commands.updateSpeakNode(attrs);
  };

  const updateHMotionNode = (attrs: Partial<IHMotionAttrs>, id: string) =>
  {
    editor.value!.commands.updateHMotionNode(attrs, id);
  };

  const updateCameraNode = (attrs: Partial<ICameraAttrs>, id: string) =>
  {
    editor.value!.commands.updateCameraNode(attrs, id);
  };

  const updateBreakNode = (attrs: Partial<IBreakNodeAttrs>, id: string) =>
  {
    editor.value!.commands.updateBreakNode(attrs, id);
  };

  /**
   * 定义获取前后文本内容的方法
   */
  const getSurroundingText = () =>
  {
    const maxLength = 10;
    const state = editor.value!.state;
    const { $from } = state.selection;

    // 获取前面的文本内容
    let before = '';
    let pos = $from.pos;
    while (pos > 0)
    {
      const resolvedPos = state.doc.resolve(pos);
      const nodeBefore = resolvedPos.nodeBefore;

      if (nodeBefore && nodeBefore.isText)
      {
        before = nodeBefore.textContent + before;
        pos -= nodeBefore.nodeSize;
      }
      else
      {
        pos -= 1;
      }
    }
    before = before.slice(-maxLength);

    // 获取后面的文本内容
    let after = '';
    pos = $from.pos;
    while (pos < state.doc.content.size)
    {
      const resolvedPos = state.doc.resolve(pos);
      const nodeAfter = resolvedPos.nodeAfter;

      if (nodeAfter && nodeAfter.isText)
      {
        after += nodeAfter.textContent;
        pos += nodeAfter.nodeSize;
      }
      else
      {
        pos += 1;
      }
    }
    after = after.slice(0, maxLength);

    // console.log('$from.pos', $from.pos);
    // console.log('before', before);
    // console.log('after', after);
    return {
      before,
      after
    };
  };

  /**
   * 获取当前光标选中的文本内容，如果当前选中多个节点，只提取文本节点的文本内容
   */
  const getSelectedText = () =>
  {
    const { state } = editor.value!;
    const { from, to, empty } = state.selection;
    let selectedText = '';

    if (empty)
    {
      return '';
    }

    // 遍历选区内的所有节点。对于每个节点，调用回调函数，其中提供了该节点及其在文档中的位置 pos
    state.doc.nodesBetween(from, to, (node, pos) =>
    {
      // 检查节点是否为文本节点
      if (node.isText)
      {
        // 截取从 from - pos 到 to - pos 之间的文本内容
        selectedText += node.textContent.slice(Math.max(0, from - pos), Math.min(node.textContent.length, to - pos));
      }
    });

    console.log('[Selected Text]\n', selectedText);

    return selectedText;
  };

  function focus()
  {
    editor.value?.commands.focus();
  }

  function setSelectionRange(range: SelectionRange)
  {
    editor.value?.commands.setTextSelection(range);
  }

  return {
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
  };
}
