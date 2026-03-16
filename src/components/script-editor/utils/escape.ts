const restrictedChars = ['"', '\'', '&', '<', '>'];

/**
 * 转义 HTML 特殊字符
 * @param str - 原始字符串
 * @returns {string} - 过滤后的字符串
 */
function escapeTextContent(str: string): string
{
  return str.replace(/["'&<>]/g, (match) =>
  {
    switch (match)
    {
      case '"': return '&quot;';
      case '\'': return '&apos;';
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      default: return match;
    }
  });
}

export function escapeHtml(html: string): string
{
  // 使用 DOMParser 解析 HTML 内容
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  console.log('escapeHtml', doc.body);
  // 遍历文档并过滤文本节点中的受限制字符
  function traverse(node: any)
  {
    if (node.nodeType === Node.TEXT_NODE)
    {
      node.nodeValue = escapeTextContent(node.nodeValue);
    }
    else
    {
      node.childNodes.forEach((childNode: any) => traverse(childNode));
    }
  }

  // 开始遍历文档内容
  traverse(doc.body);

  // 获取修改后的 HTML
  return doc.body.innerHTML;
}
