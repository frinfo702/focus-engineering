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

// URLかどうかを判定する関数
function isUrl(text) {
  // 空白を削除して純粋なテキストだけを取得
  const trimmedText = text.trim();
  
  // URLパターンの正規表現（より厳密なパターン）
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]+(\/[^\s]*)?$/;
  
  // 正規表現でチェック
  if (urlPattern.test(trimmedText)) {
    try {
      // 先頭にhttpがない場合は追加
      const urlToCheck = trimmedText.startsWith('http') ? trimmedText : `https://${trimmedText}`;
      new URL(urlToCheck);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  return false;
}

// ホスト名から表示名を取得する関数
function getSiteDisplayName(hostname) {
  // 特定のドメインに対するカスタム表示名
  const domainDisplayNames = {
    'github.com': 'GitHub',
    'docs.github.com': 'GitHub Docs',
    'zenn.dev': 'Zenn',
    'qiita.com': 'Qiita',
    'medium.com': 'Medium',
    'developer.mozilla.org': 'MDN Web Docs',
    'stackoverflow.com': 'Stack Overflow',
    'flask.palletsprojects.com': 'Flask Documentation',
    'python.org': 'Python.org',
    'labstack.com': 'Echo',
    'echo.labstack.com': 'Echo Framework',
  };

  // カスタム表示名がある場合はそれを返す
  if (domainDisplayNames[hostname]) {
    return domainDisplayNames[hostname];
  }

  // www. または先頭のサブドメインを削除
  let cleanedHostname = hostname.replace(/^www\./, '');
  
  // ドメイン部分を取得（最後のドットまで）
  const domainParts = cleanedHostname.split('.');
  if (domainParts.length >= 2) {
    // 最初のサブドメインとドメイン名だけを使用
    const mainPart = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
    return mainPart;
  }

  return cleanedHostname;
}

// URLをプレビューカードに変換する関数
function createUrlPreviewCard(url) {
  try {
    // URLを正規化
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const siteName = getSiteDisplayName(hostname);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}`;
    
    // プレビューカード形式のHTMLを生成
    return `
      <div class="embedded-url-card">
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="resource-card">
          <div class="resource-card-no-image">
            <img src="${faviconUrl}" alt="" class="resource-favicon" />
            <span>${siteName}</span>
          </div>
          <div class="resource-card-content">
            <h4>${url}</h4>
            <div class="resource-card-footer">
              <span class="resource-hostname">${hostname}</span>
            </div>
          </div>
        </a>
      </div>
    `;
  } catch (e) {
    console.error('Error creating preview card:', e);
    return null;
  }
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
  
  // 生のURLをプレビューカードに変換
  let tokens = marked.lexer(markdown);
  
  // トークンを処理して単独のURLを検出
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // 段落トークンを処理
    if (token.type === 'paragraph') {
      const text = token.text.trim();
      
      // トークンの中身がテキストだけで、そのテキストがURLかどうかをチェック
      if (isUrl(text)) {
        // プレビューカードを作成
        const cardHtml = createUrlPreviewCard(text);
        if (cardHtml) {
          // トークンを生のHTMLに置き換え
          tokens[i] = {
            type: 'html',
            pre: false,
            text: cardHtml
          };
        }
      }
    }
  }
  
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

  // 処理したトークンでマークダウンをパース
  let htmlContent = marked.parser(tokens, options);
  return htmlContent;
}
