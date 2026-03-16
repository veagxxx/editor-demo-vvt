import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { DOMParser as ProseMirrorDOMParser } from 'prosemirror-model';

const restrictedChars = ['"', '\'', '&', '<', '>'];

/**
 * 过滤掉受限制的字符
 * @param str - 原始字符串
 * @returns {string} - 过滤后的字符串
 */
function filterRestrictedChars(str: string): string
{
  return str.split('').filter(char => !restrictedChars.includes(char)).join('');
}

/**
 * 过滤受限制的字符
 */
export const RestrictSpecialChars = Extension.create({
  name: 'restrictSpecialChars',

  addProseMirrorPlugins()
  {
    return [
      new Plugin({
        key: new PluginKey('restrictSpecialCharsPlugin'),
        props: {
          // handleTextInput(view, from, to, text)
          // {
          //   console.log('handleTextInput', text);
          //   // 检查输入的文本是否包含任何受限制的字符
          //   for (const char of restrictedChars)
          //   {
          //     if (text.includes(char))
          //     {
          //       return true; // 阻止受限制字符的输入
          //     }
          //   }
          //   return false; // 允许其他字符的输入
          // },
          handlePaste(view, event, slice)
          {
            const win = window as any;
            // 获取原始粘贴内容
            const clipboardData = (event.clipboardData || win.clipboardData).getData('text/html')
              || (event.clipboardData || win.clipboardData).getData('text');

            if (!clipboardData)
            {
              return false; // 如果没有可用的粘贴内容，继续默认处理
            }

            console.log('clipboardData', clipboardData);

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

            const tr = view.state.tr.replaceSelection(fragment);
            view.dispatch(tr);
            return true; // 阻止默认粘贴行为
          }
        }
      })
    ];
  }
});
