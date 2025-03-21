import { marked } from 'marked';

// HTML特殊文字をエスケープする関数
function escapeHtml(html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 言語エイリアスのマッピング
const languageAliases = {
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'rb': 'ruby',
  'cs': 'csharp',
  'sh': 'bash',
  'yml': 'yaml',
  'go': 'go',
  'cpp': 'cpp',
  'c': 'c',
  'html': 'markup',
  'jsx': 'jsx',
  'tsx': 'tsx'
};

// マークダウンのカスタムレンダラー
export function renderMarkdown(markdown) {
  // マークダウンのレンダラーをカスタマイズ
  const renderer = new marked.Renderer();
  
  // コードブロックのカスタマイズ
  renderer.code = (code, language, isEscaped) => {
    // 言語エイリアスをマッピング
    if (language && languageAliases[language]) {
      language = languageAliases[language];
    }
    
    // Prismはブラウザ環境でのみ使用するので、サーバーサイドではシンプルなレンダリングを行う
    let highlightedCode = escapeHtml(code);
    
    // 言語が指定されているか確認し、デフォルトは「text」
    let langClass = language ? `language-${language}` : 'language-text';
    
    // コードブロックのHTML生成
    return `<pre class="${langClass}"><code class="${langClass}">${highlightedCode}</code></pre>`;
  };
  
  // インラインコードのカスタマイズ
  renderer.codespan = (code) => {
    return `<code>${escapeHtml(code)}</code>`;
  };
  
  // 見出しにIDを追加
  renderer.heading = (text, level, raw) => {
    const id = raw.toLowerCase().replace(/[^\w]+/g, '-');
    return `<h${level} id="${id}">${text}</h${level}>`;
  };

  // マークダウンのオプション設定
  const options = {
    renderer,
    gfm: true,          // GitHub Flavored Markdownを有効化
    breaks: false,       // 改行を<br>に変換しない
    pedantic: false,     // 厳密なmarkdown準拠ではなく拡張機能を有効にする
    smartLists: true,    // スマートなリスト出力
    smartypants: true,   // 引用符や省略記号などをスマートに出力
    xhtml: false,        // xhtml準拠の出力（空タグの閉じ方など）
  };

  return marked(markdown, options);
}
