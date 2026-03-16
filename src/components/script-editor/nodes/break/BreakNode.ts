import { Node, NodeViewProps, VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-3';
import { RawCommands } from '@tiptap/core';
import { UniqueUtil } from '@zeewain/common';
import { DefineComponent } from 'vue';
import BreakTag from './BreakTag.vue';
import { NodeName } from '@/components/script-editor/enums';
import {
  getNodeById, getNodePosById,
  updateNodeAttributesById
} from '@/components/script-editor/nodes/utils';
import { INodeAttrs } from '@/components/script-editor/nodes';

export interface IBreakNodeAttrs extends INodeAttrs
{
  time: string;
}

export const BreakNode = Node.create<IBreakNodeAttrs>({
  name: NodeName.BREAK,
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes()
  {
    return {
      'id': { default: '' },
      'time': { default: '1s' },
      'disabled': { default: undefined },
      'err-msg': { default: undefined }
    };
  },
  parseHTML()
  {
    return [{ tag: NodeName.BREAK }];
  },
  renderHTML({ HTMLAttributes })
  {
    return [NodeName.BREAK, mergeAttributes(HTMLAttributes)];
  },
  addNodeView()
  {
    return VueNodeViewRenderer(BreakTag as DefineComponent<NodeViewProps>);
  },
  addCommands()
  {
    return {
      // 添加停顿节点
      insertBreakNode: (attrs?: IBreakNodeAttrs) => ({ chain, state, dispatch, tr }) =>
      {
        const { selection } = state;
        const { empty, $from } = selection;

        // 检查是否没有选中文本且光标在编辑器内
        if (!empty)
        {
          return false;
        }

        // 如果不存在 attrs，说明只是检查当前位置是否可以插入 break 节点
        if (!attrs)
        {
          return true;
        }

        /*
        // 去除原因：同一个停顿标签最大仅支持10s停顿时间
        // 同一层级下如果上一个节点是 break 节点，则合并两个 break 节点
        const nodeBefore = $from.nodeBefore;

        // console.log('prevNode', nodeBefore, $from);
        if (nodeBefore && nodeBefore.type.name === 'break')
        {
          if (nodeBefore && nodeBefore.type.name === 'break')
          {
            // 修改前一个 break 节点的 time 属性值
            // 提取字符串值中的数字并相加
            const previousTime = parseFloat(nodeBefore.attrs.time);
            const newTimeValue = parseFloat(attrs.time || '0');
            const newTime = `${previousTime + newTimeValue}s`;

            const pos = $from.pos - nodeBefore.nodeSize;
            // 更新给定位置节点的属性
            tr.setNodeMarkup(pos, undefined, {
              ...nodeBefore.attrs,
              time: newTime
            });

            // 将事务应用到编辑器的状态，从而触发视图的更新。
            dispatch!(tr);
            return true;
          }
        }
        else
        {
          // 方案一：插入新的 break 节点
          // const breakNode = state.schema.nodes.break.create(attrs);
          // tr.insert($from.pos, breakNode);
          // // 将事务应用到编辑器的状态，从而触发视图的更新。
          // dispatch!(tr);
          // return true;

          // 方案二：插入新的 break 节点
          return chain()
            .insertContent({
              type: this.name,
              attrs: { ...attrs, id: `bk-${UniqueUtil.getID()}` }
            })
            .focus()
            .run();
        }
        */
        return chain()
          .insertContent({
            type: this.name,
            attrs: { ...attrs, id: `bk-${UniqueUtil.getID()}` }
          })
          .focus()
          .run();
      },
      // 更新停顿节点属性
      updateBreakNode: (attrs: Partial<IBreakNodeAttrs>, id: string) => ({ state, dispatch }) =>
      {
        return updateNodeAttributesById(state, dispatch!, id, attrs);
      },
      // 删除停顿节点
      deleteBreakNode: (id?: string) => ({ state, dispatch }) =>
      {
        console.log('deleteBreakNode start-------');
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
          console.log('deleteBreakNode end -------');

          const tr = state.tr;
          tr.delete(pos, pos + node.nodeSize); // 删除 break 节点
          dispatch!(tr);
          return true;
        }

        return false;
      }
    } as Partial<RawCommands>;
  }
});
