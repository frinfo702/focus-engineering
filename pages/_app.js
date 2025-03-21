import '../styles/globals.css';
import '../styles/prism-override.css';  // PrismJSスタイルの上書き
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';

// CDNからPrismJSをロードして問題を解決
const prismVersion = '1.29.0';

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

  return (
    <>
      <Head>
        {/* PrismJS テーマのCDNリンク */}
        <link 
          rel="stylesheet" 
          href={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/themes/prism-tomorrow.min.css`}
        />
        
        <style jsx global>{`
          code[class*="language-"],
          pre[class*="language-"],
          pre code,
          .token {
            font-family: "Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace !important;
            font-size: 14px !important;
            font-feature-settings: "ss01" !important;
          }
        `}</style>
      </Head>
      
      {/* Prism.jsをCDNから読み込む */}
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/prism.min.js`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Prism core loaded');
          applyPrismHighlighting();
        }}
      />
      
      {/* 言語サポート追加 */}
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-markup.min.js`}
        strategy="afterInteractive"
      />
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-css.min.js`}
        strategy="afterInteractive"
      />
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-javascript.min.js`}
        strategy="afterInteractive"
      />
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-jsx.min.js`}
        strategy="afterInteractive"
      />
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-typescript.min.js`}
        strategy="afterInteractive"
      />
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-tsx.min.js`}
        strategy="afterInteractive"
      />
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-bash.min.js`}
        strategy="afterInteractive"
      />
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-python.min.js`}
        strategy="afterInteractive"
      />
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-go.min.js`}
        strategy="afterInteractive"
      />
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-ruby.min.js`}
        strategy="afterInteractive"
      />
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-c.min.js`}
        strategy="afterInteractive"
      />
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-cpp.min.js`}
        strategy="afterInteractive"
      />
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-json.min.js`}
        strategy="afterInteractive"
      />
      <Script 
        src={`https://cdnjs.cloudflare.com/ajax/libs/prism/${prismVersion}/components/prism-yaml.min.js`}
        strategy="afterInteractive" 
      />
      
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 
