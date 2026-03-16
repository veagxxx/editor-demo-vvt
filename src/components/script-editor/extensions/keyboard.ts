// 禁用回车，包括回车组合键
import { Extension } from '@tiptap/vue-3';
import { NodeName } from '@/components/script-editor/enums';

/**
 * 键盘快捷键扩展
 */
export const KeyboardExtension = Extension.create({
  name: 'keyboardExtension',
  addKeyboardShortcuts()
  {
    return {
      'Enter': () =>
      {
        return this.editor.commands.focus();
      },
      'Mod-Enter': () =>
      {
        return this.editor.commands.focus();
      },
      'Shift-Enter': () =>
      {
        return this.editor.commands.focus();
      },
      'Delete': () =>
      {
        // 光标在镜头标签前和标签后，按删除键会出现异常，因此暂时先屏蔽删除键解决
        return true;
      },
      'Backspace': ({ editor }) =>
      {
        const { state, view } = editor;
        const { $from, empty } = state.selection;

        if (!empty)
        {
          // 返回 false 表示不覆盖默认行为
          return false;
        }

        // console.log('Backspace', $from, empty);
        const { nodeBefore: targetNode } = $from;
        console.log('[targetNode]', targetNode);
        // 检查前一个节点
        if (targetNode)
        {
          if ([NodeName.HMOTION, NodeName.BREAK].includes(targetNode.type.name as NodeName))
          {
            const pos = $from.pos - targetNode.nodeSize;

            const tr = state.tr;
            tr.delete(pos, pos + targetNode.nodeSize);
            view.dispatch(tr);
            return true;
          }
          else if ([NodeName.CAMERA].includes(targetNode.type.name as NodeName))
          {
            const tr = state.tr;
            // 逐一删除 camera 节点的内容，因为 camera 是非叶节点，nodeSize = 内容长度+2（开始和结束令牌）
            // 所以当nodeSize未2时，表示内容为空，会自动删除 camera 节点
            const lastChildPos = $from.pos - 2; // 当前光标位置 - 2（开始和结束令牌）
            // console.log('nodeSize', targetNode.nodeSize);
            // console.log('lastChildPos', lastChildPos);
            tr.delete(lastChildPos, lastChildPos + 1);
            view.dispatch(tr);
            return true;
          }
        }
        return false;
      }
    };
  }
});
