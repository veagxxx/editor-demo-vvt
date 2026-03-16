import { Node, NodeViewProps, VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-3';
import { RawCommands } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Fragment, Node as PMNode, Slice } from '@tiptap/pm/model';
import { UniqueUtil } from '@zeewain/common';
import { ElMessage } from 'element-plus';
import { DefineComponent } from 'vue';
import CameraTag from './CameraTag.vue';
import { NodeName } from '@/components/script-editor/enums';
import {
  getNodeById, getNodePosById,
  updateNodeAttributesById
} from '@/components/script-editor/nodes/utils';
import { INodeAttrs } from '@/components/script-editor/nodes';

export interface ICameraAttrs extends INodeAttrs
{
  name: string;
  code: string;
  type: string;
  duration: number;
}

/**
 * 递归清理嵌套的 camera 节点
 * @param fragment 原始的文档片段
 * @returns 清理后的 Fragment
 */
function removeNestedCameraNodes(fragment: Fragment): Fragment
{
  const nodes: any[] = [];

  // 遍历 fragment 中的每个节点
  fragment.forEach((childNode) =>
  {
    if (childNode.type.name === NodeName.CAMERA)
    {
      // 如果发现嵌套的 camera 节点，不添加到新 Fragment
      console.warn('Removing nested camera node:', childNode);
      // 可以选择保留 camera 节点的内容而不是整个删除
      if (childNode.content.size > 0)
      {
        // 如果 camera 节点有子内容，将其子内容提取出来
        nodes.push(...removeNestedCameraNodes(childNode.content).content);
      }
    }
    else if (childNode.content.size > 0)
    {
      // 对于非 camera 节点，递归清理其子节点
      nodes.push(
        childNode.copy(removeNestedCameraNodes(childNode.content))
      );
    }
    else
    {
      // 对于没有子内容的节点，直接添加到新 Fragment
      nodes.push(childNode);
    }
  });

  return Fragment.fromArray(nodes);
}

/**
 * 检查选区是否在 camera 节点内
 * @param doc 当前的 ProseMirror 文档
 * @param from 起始位置
 * @param to 结束位置
 * @returns 是否在 camera 节点内
 */
function isSelectionInsideCameraNode(doc: PMNode, from: number, to: number): boolean
{
  let isInsideCameraNode = false;

  doc.nodesBetween(from, to, (node) =>
  {
    if (node.type.name === NodeName.CAMERA)
    {
      isInsideCameraNode = true;
      return false; // 停止遍历
    }
    return true;
  });

  return isInsideCameraNode;
}

export const CameraNode = Node.create<ICameraAttrs>({
  name: NodeName.CAMERA,
  group: 'inline',
  content: 'inline*', // 必须设置content属性，否则无法在camera标签内添加其他标签
  inline: true,
  addAttributes()
  {
    return {
      'id': { default: '' },
      'name': { default: '' },
      'code': { default: undefined },
      'type': { default: undefined },
      'duration': { default: 0 },
      'disabled': { default: undefined },
      'err-msg': { default: undefined }
    };
  },
  parseHTML()
  {
    return [{ tag: NodeName.CAMERA }];
  },
  renderHTML({ HTMLAttributes })
  {
    return [NodeName.CAMERA, mergeAttributes(HTMLAttributes), 0];
  },
  addNodeView()
  {
    return VueNodeViewRenderer(CameraTag);
  },
  addCommands()
  {
    return {
      // 添加镜头节点
      insertCameraNode: (attrs?: ICameraAttrs) => ({ state, chain }) =>
      {
        const { selection } = state;
        const { empty, $from, $to } = selection;

        // 检查是否有选中内容
        if (empty)
        {
          // console.warn('未选中内容，无法插入镜头！');
          return false;
        }

        if (isSelectionInsideCameraNode(state.doc, $from.pos, $to.pos))
        {
          console.warn('镜头不能嵌套！');
          return false;
        }

        // 如果不存在 attrs，说明只是检查当前是否可插入镜头
        if (!attrs)
        {
          return true;
        }

        // console.log('insertCameraNode start-------');
        // 获取选中的内容并转换为 JSON
        const selectionContent = state.doc.slice($from.pos, $to.pos).content.toJSON();
        // console.log('content', state.doc.slice($from.pos, $to.pos));
        // console.log('insertCameraNode end-------');
        // 执行插入操作
        return chain()
          .deleteSelection()
          .insertContent({
            type: this.name,
            attrs: { ...attrs, id: `cam-${UniqueUtil.getID()}` },
            content: selectionContent // content 必须是toJSON()转换后的数组
          })
          .focus()
          .run();
      },
      // 更新镜头属性
      updateCameraNode: (attrs: Partial<ICameraAttrs>, id: string) => ({ state, dispatch }) =>
      {
        return updateNodeAttributesById(state, dispatch!, id, attrs);
      },
      // 删除镜头节点
      deleteCameraNode: (id?: string) => ({ state, dispatch }) =>
      {
        const { selection } = state;
        const { $from } = selection;
        let targetNode;
        let pos: number;
        if (id)
        {
          targetNode = getNodeById(state, id);
          pos = getNodePosById(state, id)!;
        }
        else
        {
          targetNode = $from.nodeBefore;
          pos = $from.pos - targetNode!.nodeSize;
        }
        // console.log('targetNode', targetNode, $from.pos - targetNode!.nodeSize);
        if (targetNode && targetNode.type.name === this.name)
        {
          // 获取 camera 节点的内容
          const fragment = targetNode.content;

          console.log('deleteCameraNode start-------');
          console.log('$from', $from);
          console.log('cameraNode', targetNode);
          console.log('pos', pos);
          console.log('nodeSize', targetNode.nodeSize);
          console.log('fragment', fragment);
          console.log('deleteCameraNode end-------');

          const tr = state.tr;
          tr.delete(pos, pos + targetNode.nodeSize); // 删除 camera 节点
          tr.insert(pos, fragment); // 插入 camera 节点的内容
          dispatch!(tr);
          return true;
        }

        return false;
      }
    } as Partial<RawCommands>;
  },
  addProseMirrorPlugins()
  {
    return [
      new Plugin({
        key: new PluginKey('handleCameraPaste'),
        props: {
          handlePaste: (view, event, slice) =>
          {
            const { state, dispatch } = view;
            const { selection } = state;
            const { $from, $to } = selection;

            // 判断粘贴的内容是否包含 camera 节点
            if (isSelectionInsideCameraNode(state.doc, $from.pos, $to.pos))
            {
              ElMessage.warning('粘贴的内容存在镜头导致重叠，系统已自动移除镜头标签，仅保留内容');
              // 如果在 camera 节点内，清理嵌套的 camera 节点，保留内容
              const cleanedFragment = removeNestedCameraNodes(slice.content);
              const cleanedSlice = new Slice(cleanedFragment, slice.openStart, slice.openEnd);
              const tr = state.tr.replaceSelection(cleanedSlice);
              dispatch(tr);
              return true;
            }

            // 如果不在 camera 节点内或没有嵌套的 camera 节点，继续执行默认的粘贴行为
            return false; // 返回 false 表示未处理，让默认粘贴行为接管
          }
        }
      })
    ];
  }
});
