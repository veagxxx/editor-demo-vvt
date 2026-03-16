import { generateHTML, generateJSON } from '@tiptap/html';
import { extensions } from '@/components/script-editor';
import { NodeAttrs } from '@/components/script-editor/types';

interface NodeWithParent
{
  node: Record<string, any>;
  parent?: Record<string, any>;
}

/**
 * 生成JSON内容
 * @param htmlContent
 */
export function generateJSONContent(htmlContent: string)
{
  return generateJSON(htmlContent, [
    ...extensions
  ]);
}

/**
 * 生成HTML内容
 * @param jsonContent
 */
export function generateHtmlContent(jsonContent: Record<string, any>)
{
  return generateHTML(jsonContent, [
    ...extensions
  ]);
}

/**
 * 将纯文本转换为HTML
 * @param pureText
 */
export function convertPureTextToHtml(pureText: string)
{
  return generateHtmlContent(generateJSONContent(pureText));
}

/**
 * 获取所有节点
 * @param jsonContent
 */
export function getAllNodes(jsonContent: Record<string, any>): Record<string, any>[]
{
  return getNodesByAttrs({}, jsonContent).map(item => item.node);
}

/**
 * 通过指定属性获取节点及其父节点
 * @param attrs - 要匹配的属性
 * @param jsonContent - 当前节点
 * @param parent - 父节点（初始为null）
 */
export function getNodesByAttrs(attrs: NodeAttrs, jsonContent: Record<string, any>, parent?: Record<string, any>)
{
  const nodes: NodeWithParent[] = [];

  if (jsonContent.attrs)
  {
    let isMatch = true;
    for (const key in attrs)
    {
      if ((attrs as any)[key] !== jsonContent.attrs[key])
      {
        isMatch = false;
        break;
      }
    }

    if (isMatch)
    {
      nodes.push({ node: jsonContent, parent });
    }
  }

  if (jsonContent.content)
  {
    for (const node of jsonContent.content)
    {
      const result = getNodesByAttrs(attrs, node, jsonContent); // 传递当前节点作为子节点的父节点
      nodes.push(...result);
    }
  }

  return nodes;
}

/**
 * 通过节点类型获取节点及其父节点
 * @param type
 * @param jsonContent
 * @param parent
 */
export function getNodesByType(type: string, jsonContent: Record<string, any>, parent?: Record<string, any>)
{
  const nodes: NodeWithParent[] = [];
  if (jsonContent.type)
  {
    if (jsonContent.type === type)
    {
      nodes.push({ node: jsonContent, parent });
    }
  }
  if (jsonContent.content)
  {
    for (const node of jsonContent.content)
    {
      const result = getNodesByType(type, node, jsonContent);
      nodes.push(...result);
    }
  }
  return nodes;
}
/**
 * 修改指定属性ID的节点属性
 * @param id
 * @param attrs
 * @param jsonContent
 */
export function updateNodeAttrsById(id: string, attrs: NodeAttrs, jsonContent: Record<string, any>)
{
  if (jsonContent.attrs && jsonContent.attrs.id === id)
  {
    jsonContent.attrs = {
      ...jsonContent.attrs,
      ...attrs
    };
    return true;
  }

  if (jsonContent.content)
  {
    for (const node of jsonContent.content)
    {
      const result = updateNodeAttrsById(id, attrs, node);
      if (result)
      {
        return true;
      }
    }
  }

  return false;
}

/**
 * 递归遍历 JSON 对象，收集所有文本内容
 * @param jsonContent - JSON 内容对象
 * @param textArray - 用于存储文本内容的数组
 */
function collectTextContent(jsonContent: Record<string, any>, textArray: string[])
{
  if (jsonContent.type === 'text')
  {
    textArray.push(jsonContent.text);
  }

  if (jsonContent.content)
  {
    for (const node of jsonContent.content)
    {
      collectTextContent(node, textArray);
    }
  }
}

/**
 * 获取 JSON 内容对象中的所有文本内容
 * @param jsonContent - JSON 内容对象
 * @returns {string} - 所有文本内容拼接的字符串
 */
export function getTextContent(jsonContent: Record<string, any>): string
{
  const textArray: string[] = [];
  collectTextContent(jsonContent, textArray);
  return textArray.join('');
}
