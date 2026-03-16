import Document from '@tiptap/extension-document';
import StarterKit from '@tiptap/starter-kit';
import { AnyExtension } from '@tiptap/vue-3';
import { BreakNode, CameraNode, HMotionNode, SpeakNode } from '@/components/script-editor/nodes';
import {
  KeyboardExtension,
  PasteProcessPlugin
} from '@/components/script-editor/extensions';

export const extensions = [
  StarterKit.configure({
    document: false,
    paragraph: false,
    blockquote: false,
    bulletList: false,
    codeBlock: false,
    hardBreak: false,
    heading: false,
    horizontalRule: false,
    listItem: false,
    orderedList: false,
    bold: false,
    code: false,
    italic: false,
    strike: false
  }),
  Document.extend({
    content: 'speak'
  }),
  SpeakNode,
  CameraNode,
  HMotionNode,
  BreakNode,
  KeyboardExtension,
  PasteProcessPlugin
] as AnyExtension[];
