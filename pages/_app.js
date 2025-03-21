import '../styles/globals.css';
import 'prismjs/themes/prism-tomorrow.css';  // シンタックスハイライトのテーマ
import { useEffect } from 'react';
import Prism from 'prismjs';
// 言語サポートを追加
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-bash';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // クライアントサイドでのコード実行
    if (typeof window !== 'undefined') {
      // コードをハイライト
      Prism.highlightAll();
      
      // コピーボタンの追加
      document.querySelectorAll('pre code').forEach(block => {
        // 既存のコピーボタンがあれば削除
        const parent = block.parentNode;
        const existingButton = parent.querySelector('.copy-button');
        if (existingButton) {
          existingButton.remove();
        }

        // コピーボタンを追加
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'コピー';
        
        // ボタンクリックでコードをコピー
        button.addEventListener('click', () => {
          const code = block.textContent;
          navigator.clipboard.writeText(code).then(() => {
            // 成功時の表示
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
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp; 
