import { Node, NodeViewProps, VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-3';
import { RawCommands } from '@tiptap/core';
import { UniqueUtil } from '@zeewain/common';
import { DefineComponent } from 'vue';
import HMotionTag from './HMotionTag.vue';
import { NodeName } from '@/components/script-editor/enums';
import {
  getNodeById, getNodePosById,
  updateNodeAttributesById
} from '@/components/script-editor/nodes/utils';
import { INodeAttrs } from '@/components/script-editor/nodes';

export interface IHMotionAttrs extends INodeAttrs
{
  name: string;
  code: string;
  type: string;
  duration: number;
}

export const HMotionNode = Node.create<IHMotionAttrs>({
  name: NodeName.HMOTION,
  group: 'inline',
  inline: true,
  atom: true,
  isolating: true,
  addAttributes()
  {
    return {
      'id': { default: '' },
      'name': { default: '' },
      'code': { default: undefined },
      'type': { default: undefined },
      'duration': { default: 0 }, // 镜头持续时间，单位：秒
      'disabled': { default: undefined },
      'err-msg': { default: undefined }
    };
  },
  parseHTML()
  {
    return [{ tag: NodeName.HMOTION }];
  },
  renderHTML({ HTMLAttributes })
  {
    return [NodeName.HMOTION, mergeAttributes(HTMLAttributes)];
  },
  addNodeView()
  {
    return VueNodeViewRenderer(HMotionTag);
  },
  addCommands()
  {
    return {
      // 添加动作节点
      insertHMotionNode: (attrs?: IHMotionAttrs) => ({ state, chain }) =>
      {
        const { selection } = state;
        const { empty, $from } = selection;

        // 检查是否没有选中文本
        if (!empty)
        {
          return false;
        }

        // 初步检查是否可以插入动作
        if (!attrs)
        {
          return true;
        }

        // 插入新的 hmotion 节点
        return chain()
          .insertContent({
            type: this.name,
            attrs: { ...attrs, id: `hm-${UniqueUtil.getID()}` }
          })
          .focus()
          .run();
      },
      // 更新动作节点属性
      updateHMotionNode: (attrs: Partial<IHMotionAttrs>, id: string) => ({ state, dispatch }) =>
      {
        return updateNodeAttributesById(state, dispatch!, id, attrs);
      },
      // 删除动作节点
      deleteHMotionNode: (id?: string) => ({ state, dispatch }) =>
      {
        console.log('deleteHMotionNode start-------');
        const { selection } = state;
        const { $from } = selection;
        let node;
        let pos: number;
        if (id)
        {
          node = getNodeById(state, id);
          pos = getNodePosById(state, id)!;
        }
        else
        {
          node = $from.nodeAfter!;
          pos = $from.pos;
        }
        console.log('targetNode', node, $from);
        if (node)
        {
          console.log('pos', pos);
          console.log('nodeSize', node.nodeSize);
          console.log('deleteHMotionNode end -------');

          const tr = state.tr;
          tr.delete(pos, pos + node.nodeSize); // 删除 hmotion 节点
          dispatch!(tr);
          return true;
        }

        return false;
      }
    } as Partial<RawCommands>;
  }
});
