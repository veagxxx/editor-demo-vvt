import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Fragment, DOMParser as ProseMirrorDOMParser, Slice } from 'prosemirror-model';
import { UniqueUtil } from '@zeewain/common';
import { NodeName } from '@/components/script-editor/enums';

/**
 * 递归处理粘贴内容中特定节点的id属性
 * @param fragment - 文档片段
 * @returns - 处理后的文档片段
 */
function processNodeIds(fragment: Fragment): Fragment
{
  const nodes: any[] = [];

  // 遍历fragment中的每个节点
  fragment.forEach((node) =>
  {
    let newNode = node;

    // 检查节点类型
    if (node.type.name === NodeName.CAMERA)
    {
      // 为Camera节点生成新ID
      newNode = node.type.create(
        { ...node.attrs, id: `cam-${UniqueUtil.getID()}` },
        node.content,
        node.marks
      );
    }
    else if (node.type.name === NodeName.HMOTION)
    {
      // 为HMotion节点生成新ID
      newNode = node.type.create(
        { ...node.attrs, id: `hm-${UniqueUtil.getID()}` },
        node.content,
        node.marks
      );
    }
    else if (node.type.name === NodeName.BREAK)
    {
      // 为Break节点生成新ID
      newNode = node.type.create(
        { ...node.attrs, id: `bk-${UniqueUtil.getID()}` },
        node.content,
        node.marks
      );
    }

    // 如果节点有子内容，递归处理
    if (newNode.content && newNode.content.size > 0)
    {
      newNode = newNode.copy(processNodeIds(newNode.content));
    }

    nodes.push(newNode);
  });

  return Fragment.fromArray(nodes);
}

/**
 * 过滤受限制的字符（从RestrictSpecialChars复制过来，确保扩展之间的兼容性）
 */
const restrictedChars = ['"', '\'', '&', '<', '>'];

function filterRestrictedChars(str: string): string
{
  return str.split('').filter(char => !restrictedChars.includes(char)).join('');
}

/**
 * 粘贴内容处理插件
 */
export const PasteProcessPlugin = Extension.create({
  name: 'pasteProcessPlugin',

  addProseMirrorPlugins()
  {
    return [
      new Plugin({
        key: new PluginKey('pasteProcessPlugin'),
        props: {
          handlePaste: (view, event, slice) =>
          {
            const win = window as any;
            // 获取原始粘贴内容
            const clipboardData = (event.clipboardData || win.clipboardData).getData('text/html')
              || (event.clipboardData || win.clipboardData).getData('text');

            if (!clipboardData)
            {
              return false; // 如果没有可用的粘贴内容，继续默认处理
            }

            console.log('粘贴内容处理中...', clipboardData);

            // 使用 DOMParser 解析 HTML 内容
            const parser = new DOMParser();
            const doc = parser.parseFromString(clipboardData, 'text/html');

            // 遍历文档并过滤文本节点中的受限制字符
            function traverse(node: any)
            {
              if (node.nodeType === Node.TEXT_NODE)
              {
                node.textContent = filterRestrictedChars(node.textContent);
              }
              for (let i = 0; i < node.childNodes.length; i++)
              {
                traverse(node.childNodes[i]);
              }
            }

            traverse(doc.body);

            // 使用 ProseMirrorDOMParser 解析修改后的 DOM
            const schema = view.state.schema;
            const fragment = ProseMirrorDOMParser.fromSchema(schema).parseSlice(doc.body);

            // 处理粘贴内容中的特定节点ID
            const processedContent = processNodeIds(fragment.content);

            // 创建新的Slice对象
            const newSlice = new Slice(
              processedContent,
              fragment.openStart,
              fragment.openEnd
            );

            // 应用修改后的内容
            const tr = view.state.tr.replaceSelection(newSlice);
            view.dispatch(tr);

            // 返回true表示已处理粘贴事件
            return true;
          }
        }
      })
    ];
  }
});
