import { Node } from '@tiptap/pm/model';
import { EditorState, Transaction } from '@tiptap/pm/state';

/**
 *  递归获取 node 的所有文本内容
 * @param node
 */
export function getNodeTextContent(node: Node)
{
  let textContent = '';

  node.content.forEach((child: Node) =>
  {
    if (child.isText)
    {
      textContent += child.text;
    }
    else
    {
      textContent += getNodeTextContent(child);
    }
  });

  return textContent;
}

/**
 * 通过节点属性获取节点实例
 * @param state
 * @param attrs
 */
export function getNodesByAttrs(state: EditorState, attrs: Record<string, any>)
{
  const foundNodes: Node[] = [];
  state.doc.descendants((node) =>
  {
    if (node.attrs && Object.keys(attrs).every(key => node.attrs[key] === attrs[key]))
    {
      foundNodes.push(node);
    }
    return true; // 继续遍历（遍历整个文档树）
  });
  return foundNodes;
}

/**
 * 根据 id属性 获取节点实例
 * @param state
 * @param id
 */
export function getNodeById(state: EditorState, id: string)
{
  let foundNode: Node | undefined;
  state.doc.descendants((node) =>
  {
    if (node.attrs.id === id)
    {
      foundNode = node;
      return false; // 停止遍历
    }
    return true; // 继续遍历
  });
  return foundNode;
}

/**
 * 通过节点 ID 获取节点在文档中的位置
 * @param state
 * @param id - 要查找的节点 ID
 * @returns {number | null} 节点在文档中的位置
 */
export function getNodePosById(state: EditorState, id: string)
{
  let foundPos: number | undefined;

  state.doc.descendants((node, pos) =>
  {
    if (node.attrs.id === id)
    {
      foundPos = pos;
      return false; // 停止遍历
    }
    return true; // 继续遍历
  });

  return foundPos;
}

/**
 * 通过节点 ID 更新节点属性
 * @param state - ProseMirror 编辑器状态实例
 * @param dispatch - ProseMirror dispatch 函数
 * @param id - 要查找的节点 ID
 * @param attrs - 要更新的属性对象
 * @returns {boolean} 是否成功更新节点属性
 */
export function updateNodeAttributesById(state: EditorState, dispatch: (tr: Transaction) => void, id: string, attrs: Record<string, any>): boolean
{
  const pos = getNodePosById(state, id);

  if (pos !== undefined)
  {
    const node = state.doc.nodeAt(pos);

    if (node)
    {
      const newAttrs = {
        ...node.attrs,
        ...attrs
      };

      dispatch(state.tr.setNodeMarkup(pos, undefined, newAttrs));
      return true;
    }
  }

  return false;
}
