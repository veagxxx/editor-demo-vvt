import { mergeAttributes } from '@tiptap/vue-3';
import { Paragraph } from '@tiptap/extension-paragraph';
import { NodeName } from '@/components/script-editor/enums';

export interface ISpeakAttrs
{
  volume: number;
  rate?: number;
}

// 继承Paragraph节点，以便支持内联排版
export const SpeakNode = Paragraph.extend<ISpeakAttrs>({
  name: NodeName.SPEAK,
  // group: 'block',
  // content: 'inline*', // 所有子项以内联方式排版
  addAttributes()
  {
    return {
      // volume: { default: 50 },
      // rate: { default: undefined }
    };
  },
  parseHTML()
  {
    return [{ tag: NodeName.SPEAK }];
  },
  renderHTML({ HTMLAttributes })
  {
    return [NodeName.SPEAK, mergeAttributes(HTMLAttributes), 0];
  },
  // addNodeView()
  // {
  //   return VueNodeViewRenderer(SpeakTag as DefineComponent<NodeViewProps>);
  // },
  addCommands()
  {
    return {
      // 更新停顿节点属性
      updateSpeakNode: (attrs: Partial<ISpeakAttrs>) => ({ state, dispatch }) =>
      {
        const speakNode = state.doc.nodeAt(0);
        if (speakNode)
        {
          const newAttrs = {
            ...speakNode.attrs,
            ...attrs
          };

          dispatch!(state.tr.setNodeMarkup(0, undefined, newAttrs));
          return true;
        }
        return false;
      }
    };
  }
});
