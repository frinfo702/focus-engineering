import '../styles/globals.css';
import '../styles/prism-override.css';  // PrismJSスタイルの上書き
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';

// CDNからPrismJSをロードして問題を解決
const prismVersion = '1.29.0';

// スクリプトを動的にロードする関数
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// スタイルシートを動的にロードする関数
const loadStylesheet = (href) => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // シンタックスハイライトを適用する関数
  const applyPrismHighlighting = () => {
    if (typeof window !== 'undefined' && window.Prism) {
      try {
        // コードをハイライト
        window.Prism.highlightAll();
        
        // 言語バッジとコピーボタンの追加
        document.querySelectorAll('pre code').forEach(block => {
          const parent = block.parentNode;
          
          // 既存のボタンとバッジがあれば削除
          parent.querySelectorAll('.copy-button, .language-badge').forEach(el => el.remove());
          
          // 言語クラスを確認して表示
          const classList = [...block.classList];
          const langClass = classList.find(cls => cls.startsWith('language-'));
          const language = langClass ? langClass.replace('language-', '') : 'text';
          
          // 言語バッジを追加 (textではない場合のみ)
          if (language !== 'text') {
            const langBadge = document.createElement('span');
            langBadge.className = 'language-badge';
            langBadge.textContent = language;
            parent.insertBefore(langBadge, block);
          }
          
          // PrismJSのコードブロックにカスタムスタイルを適用
          block.style.fontFamily = '"Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace';
          block.style.fontSize = '14px';
          block.style.fontFeatureSettings = '"ss01"';
          
          // コピーボタンを追加
          const button = document.createElement('button');
          button.className = 'copy-button';
          button.textContent = 'コピー';
          
          // ボタンクリックでコードをコピー
          button.addEventListener('click', () => {
            const code = block.textContent;
            navigator.clipboard.writeText(code).then(() => {
              button.textContent = 'コピー完了！';
              setTimeout(() => {
                button.textContent = 'コピー';
              }, 2000);
            }).catch(err => {
              console.error('コピーに失敗しました:', err);
              button.textContent = 'コピー失敗';
              setTimeout(() => {
                button.textContent = 'コピー';
              }, 2000);
            });
          });
          
          // preの先頭にボタンを追加
          parent.insertBefore(button, block);
        });
      } catch (error) {
        console.error('ハイライト処理エラー:', error);
      }
    }
  };
  
  // ページロード時のハイライト処理
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Prism) {
      applyPrismHighlighting();
    }
  }, []);
  
  // ページ遷移時のハイライト処理
  useEffect(() => {
    const handleRouteChange = () => {
      // ルート変更後にハイライト処理を適用
      if (typeof window !== 'undefined' && window.Prism) {
        setTimeout(applyPrismHighlighting, 100);
      }
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // PrismJSのインポートと設定（クライアントサイドのみ）
  useEffect(() => {
    const initPrism = async () => {
      try {
        // PrismJSとテーマの読み込み
        await Promise.all([
          // CDNからPrismのコアをロード
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/prism.min.js`),
          // CDNからPrismのCSSをロード (VSCodeライクなテーマを使用)
          loadStylesheet(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/themes/prism-tomorrow.min.css`),
          // 言語サポートを追加
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-javascript.min.js`),
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-typescript.min.js`),
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-jsx.min.js`),
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-tsx.min.js`),
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-css.min.js`),
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-python.min.js`),
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-go.min.js`),
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-java.min.js`),
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-ruby.min.js`),
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-bash.min.js`),
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-json.min.js`),
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-yaml.min.js`),
          loadScript(`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-markdown.min.js`),
        ]);

        // PrismJSの手動ハイライト処理
        if (window.Prism) {
          window.Prism.highlightAll();
          applyPrismHighlighting();
        }
      } catch (error) {
        console.error('PrismJSの読み込みに失敗しました:', error);
      }
    };

    if (typeof window !== 'undefined') {
      initPrism();
    }

    // コンポーネントがアンマウントされたときのクリーンアップ
    return () => {
      // クリーンアップが必要な場合はここに記述
    };
  }, []);

  return (
    <>
      <Head>
        <style jsx global>{`
          code[class*="language-"],
          pre[class*="language-"],
          pre code,
          .token {
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace !important;
            font-size: 14px !important;
          }
        `}</style>
      </Head>
      
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 
