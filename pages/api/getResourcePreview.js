import axios from 'axios';
import cheerio from 'cheerio';

// サイトのホスト名から簡易的な表示名を生成
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
    'nodejs.org': 'Node.js',
    'reactjs.org': 'React',
    'vuejs.org': 'Vue.js',
    'angular.io': 'Angular',
    'npmjs.com': 'npm',
    'docs.microsoft.com': 'Microsoft Docs',
    'developer.apple.com': 'Apple Developer',
    'aws.amazon.com': 'AWS',
    'cloud.google.com': 'Google Cloud',
    'azure.microsoft.com': 'Azure',
    'youtube.com': 'YouTube',
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

// リソースタイプに基づいた説明文を生成
function getDescriptionByType(type, hostname) {
  const typeDescriptions = {
    'article': 'この記事では関連するトピックについて解説しています',
    'documentation': '公式ドキュメントで詳しい情報を確認できます',
    'github': 'GitHubリポジトリでコード例やライブラリを確認できます',
    'tutorial': 'チュートリアルで実践的な知識を学べます',
    'video': '動画で視覚的に理解を深められます',
    'tool': '便利なツールやサービスです',
    'website': '関連するウェブサイトです',
  };

  if (typeDescriptions[type]) {
    return typeDescriptions[type];
  }

  const siteName = getSiteDisplayName(hostname);
  return `${siteName}のリソースで関連情報を確認できます`;
}

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // CORSエラーを回避するための設定
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      },
      timeout: 5000,
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 基本情報の取得
    const hostname = new URL(url).hostname;
    const siteName = getSiteDisplayName(hostname);

    // OGP情報を抽出
    const title = $('meta[property="og:title"]').attr('content') || 
                  $('meta[name="twitter:title"]').attr('content') || 
                  $('title').text() || 
                  `${siteName}のリソース`;
                  
    const description = $('meta[property="og:description"]').attr('content') || 
                        $('meta[name="twitter:description"]').attr('content') || 
                        $('meta[name="description"]').attr('content') || 
                        getDescriptionByType('website', hostname);
                        
    let image = $('meta[property="og:image"]').attr('content') || 
                $('meta[name="twitter:image"]').attr('content') || 
                '';
                
    const type = $('meta[property="og:type"]').attr('content') || 'website';
    
    // 画像URLの検証と絶対パスへの変換
    if (image) {
      // 相対パスの場合は絶対パスに変換
      if (image.startsWith('/')) {
        const baseUrl = new URL(url);
        image = `${baseUrl.origin}${image}`;
      } else if (!image.startsWith('http')) {
        // URLスキームがない場合
        image = '';
      }
      
      // 画像URLが有効か確認
      try {
        const imageCheck = await axios.head(image, { timeout: 3000 });
        if (imageCheck.status !== 200) {
          image = '';
        }
      } catch (error) {
        console.error('Image URL check failed:', error.message);
        image = '';
      }
    }

    // 結果を返す
    res.status(200).json({
      title,
      description,
      image,
      type,
      url,
      hostname,
      siteName
    });
  } catch (error) {
    console.error('Error fetching resource preview:', error.message);
    
    // エラーの場合はホスト名を使って意味のある情報を返す
    try {
      const hostname = new URL(url).hostname;
      const siteName = getSiteDisplayName(hostname);
      const generatedDescription = getDescriptionByType('website', hostname);
      
      res.status(200).json({
        title: `${siteName}のリソース`,
        description: generatedDescription,
        image: '',
        type: 'website',
        url,
        hostname,
        siteName
      });
    } catch (e) {
      res.status(200).json({
        title: '関連リソース',
        description: '問題解決に役立つ外部リソースです',
        image: '',
        type: 'website',
        url,
        hostname: 'unknown',
        siteName: '関連サイト'
      });
    }
  }
} 
