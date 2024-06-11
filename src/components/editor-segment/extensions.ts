import { mergeAttributes, Node, Extension  } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import PauseNodeView from './PauseNode.vue';
import SpeakTextView from './SpeakText.vue';
import SegmentNodeView from './SegmentNode.vue';
import { NodeName, SegmentTag } from './editor.enum';

interface ISegmentNodeOption
{
  name: string;
  tag: string;
  attrs?: Record<string, any>;
}

// 禁用回车，包括回车组合键
export const NoEnterExtension = Extension.create({
  name: 'noEnterExtension',
  addKeyboardShortcuts() {
    return {
      'Enter': () => {
        return this.editor.commands.focus();
      },
      'Mod-Enter': () => {
        return this.editor.commands.focus();
      },
      'Shift-Enter': () => {
        return this.editor.commands.focus();
      }
    }
  }
});

// 停顿节点
export const PauseNode = Node.create({
  name: NodeName.Pause,
  group: 'inline',
  inline: true, // 标记为内联节点
  atom: true,  // 表示这是一个原子节点，不可分割
  addAttributes() {
    return {
      isHover: {
        default: false
      },
      time: {
        default: 0
      }
    }
  },
  parseHTML() {
    return [
      {
        tag: SegmentTag.Pause,
        getAttrs(dom: HTMLElement) {
          const time = dom.getAttribute('time');
          return { time }
        },
      },
    ];
  },
  renderHTML({ node }) {
    const time = node.attrs.time;
    return [SegmentTag.Pause, mergeAttributes({ time }), ''];
  },
  addNodeView() {
    return VueNodeViewRenderer(PauseNodeView);
  },
});

// 语音节点(根节点)
export const SpeakNode = Node.create({
  name: NodeName.Speak,
  group: 'block',
  content: 'inline*',
  // 优先级覆盖p标签 Paragraph (默认渲染为段落p标签，源码的Paragraph是1000)
  priority: 1001,

  addAttributes() {
    return {
      // [0,100]之间的整数。默认值为50。大于50表示增大音量。 小于50表示减小音量。
      volume: {
        default: 50,
      },
      // [-500,500]之间的整数。默认值为0。大于0表示加快语速。小于0表示减慢语速。
      rate: {
        default: 0
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: SegmentTag.Speak,
        getAttrs(dom) {
          const volume = dom.getAttribute('volume') || 50;
          const rate = dom.getAttribute('rate') || 0;
          return { volume, rate };
        },
      },
    ];
  },
  renderHTML({ node }) {
    const volume = node.attrs.volume;
    const rate = node.attrs.rate;
    return [SegmentTag.Speak, mergeAttributes({ volume, rate }), 0];
  },
  addNodeView() {
    return VueNodeViewRenderer(SpeakTextView);
  }
});

// 创建 动作 or 场景 节点
export function createSegmentNode(options: ISegmentNodeOption)
{
  return Node.create({
    name: options.name,
    group: 'inline',
    inline: true,
    atom: true,
    addAttributes() {
      return {
        duration: {
          default: 0
        },
        code: {
          default: ''
        },
        text: {
          default: ''
        },
        class: {
          default: `${options.tag}-node`
        },
        isHover: {
          default: false,
        },
        ...options.attrs
      }
    },
    parseHTML() {
      return [
        {
          tag: options.tag,
          getAttrs(dom: HTMLElement) {
            const duration = dom.getAttribute('duration') || 0;
            const code = dom.getAttribute('code') || '';
            return { duration, code };
          },
        },
      ];
    },
    renderHTML({ node }) {
      const duration = node.attrs.duration;
      const code = node.attrs.code;
      const attrs = { duration, code };
      return [options.tag, mergeAttributes(attrs), ''];
    },
    addNodeView() {
      return VueNodeViewRenderer(SegmentNodeView);
    },
  });
}
