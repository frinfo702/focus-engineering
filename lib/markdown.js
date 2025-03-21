import { marked } from 'marked';

// マークダウンレンダラーをカスタマイズ
export function renderMarkdown(content) {
  const renderer = new marked.Renderer();
  
  // コードブロックのカスタマイズ
  renderer.code = (code, language) => {
    return `<pre class="language-${language}"><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
  };
  
  // マークダウンをHTMLに変換
  return marked(content, { renderer });
}

// HTMLエスケープ用の関数
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
