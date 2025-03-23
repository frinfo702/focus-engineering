import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAllLanguages, getLanguage } from '../../../data/languages';
import { getProblem, getProblemsByLanguage, getAllProblemPaths, getCategoriesByLanguage, getCategoryName } from '../../../lib/problems';

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

export default function Problem({ language, problem, sidebarProblems, categories }) {
  const router = useRouter();
  const [resourcePreviews, setResourcePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    async function fetchResourcePreviews() {
      if (problem.relatedResources && problem.relatedResources.length > 0) {
        setLoading(true);
        
        try {
          // 各リソースのOGP情報を取得
          const previewPromises = problem.relatedResources.map(async (resource, index) => {
            // ホスト名を取得
            let hostname = '';
            let siteName = '';
            
            try {
              hostname = new URL(resource.url).hostname;
              siteName = getSiteDisplayName(hostname);
            } catch (e) {
              console.error(`Invalid URL: ${resource.url}`, e);
              return {
                id: index,
                url: resource.url || '#',
                title: resource.title || '関連リソース',
                description: resource.description || '問題解決に役立つ外部リソースです',
                image: resource.image || '',
                type: resource.type || 'website',
                hostname: 'unknown',
                siteName: '関連サイト'
              };
            }
            
            // すでに必要な情報が含まれている場合はそれを使用
            if (resource.title && resource.description && resource.image) {
              return {
                id: index,
                url: resource.url,
                title: resource.title,
                description: resource.description,
                image: resource.image,
                type: resource.type || 'article',
                hostname,
                siteName
              };
            }
            
            try {
              // APIを呼び出してOGP情報を取得
              const response = await axios.get(`/api/getResourcePreview?url=${encodeURIComponent(resource.url)}`);
              const ogpData = response.data;
              
              // 適切な説明文を決定
              const fallbackDescription = getDescriptionByType(resource.type || ogpData.type || 'website', ogpData.hostname || hostname);
              
              return {
                id: index,
                url: resource.url,
                title: resource.title || ogpData.title || `${siteName}のリソース`,
                description: resource.description || ogpData.description || fallbackDescription,
                image: resource.image || ogpData.image || '',
                type: resource.type || ogpData.type || 'website',
                hostname: ogpData.hostname || hostname,
                siteName: ogpData.siteName || siteName
              };
            } catch (error) {
              console.error(`Error fetching preview for ${resource.url}:`, error);
              
              // エラーの場合でも自然な説明文を表示
              let fallbackDescription = '';
              try {
                fallbackDescription = getDescriptionByType(resource.type || 'website', hostname);
              } catch (e) {
                fallbackDescription = '問題解決に役立つリソースです';
              }
              
              return {
                id: index,
                url: resource.url,
                title: resource.title || `${siteName || '関連'}のリソース`,
                description: resource.description || fallbackDescription,
                image: resource.image || '',
                type: resource.type || 'website',
                hostname: hostname || 'unknown',
                siteName: siteName || '関連サイト'
              };
            }
          });
          
          const previews = await Promise.all(previewPromises);
          setResourcePreviews(previews);
        } catch (error) {
          console.error('Error fetching resource previews:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchResourcePreviews();
  }, [problem.relatedResources]);
  
  if (router.isFallback) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <header className="header">
        <h1 className="logo">Focus-Engineering</h1>
        <nav>
          <Link href="/">Home</Link>
        </nav>
      </header>

      <div className="container">
        <div className="problem-layout">
          {/* サイドバー */}
          <aside className="problem-sidebar">
            <h3>{language.name}の問題一覧</h3>
            <ul className="sidebar-problem-list">
              {categories.map(category => {
                // カテゴリに属する問題を抽出
                const categoryProblems = sidebarProblems.filter(p => p.category === category.id);
                
                if (categoryProblems.length === 0) return null;
                
                return (
                  <li key={category.id} className="sidebar-category">
                    <h4>{category.name}</h4>
                    <ul>
                      {categoryProblems.map(p => (
                        <li key={p.id} className={p.id === problem.id ? 'active' : ''}>
                          <Link href={`/problems/${language.id}/${p.id}`}>
                            {p.title || p.id}
                            {p.difficulty && (
                              <span className="sidebar-difficulty" data-level={p.difficulty}>{p.difficulty}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
              
              {/* 未分類の問題 */}
              {(() => {
                const uncategorizedProblems = sidebarProblems.filter(p => !p.category);
                
                if (uncategorizedProblems.length === 0) return null;
                
                return (
                  <li className="sidebar-category">
                    <h4>未分類</h4>
                    <ul>
                      {uncategorizedProblems.map(p => (
                        <li key={p.id} className={p.id === problem.id ? 'active' : ''}>
                          <Link href={`/problems/${language.id}/${p.id}`}>
                            {p.title || p.id}
                            {p.difficulty && (
                              <span className="sidebar-difficulty" data-level={p.difficulty}>{p.difficulty}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })()}
            </ul>
          </aside>
          
          {/* メインコンテンツ */}
          <main className="problem-main">
            <div className="problem-header">
              <h1>{problem.title || problem.id}</h1>
              <div className="tags">
                {problem.difficulty && (
                  <span className="difficulty" data-level={problem.difficulty}>{problem.difficulty}</span>
                )}
                {problem.category && (
                  <span className="category">
                    {categories.find(c => c.id === problem.category)?.name || problem.category}
                  </span>
                )}
              </div>
            </div>
            
            <div className="problem-content-wrapper">
              <div className="problem-content">
                <div dangerouslySetInnerHTML={{ __html: problem.content }} />
              </div>
            </div>
          </main>
          
          {/* 関連リソース（右側） */}
          {resourcePreviews.length > 0 ? (
            <aside className="resource-sidebar">
              <h3>関連リソース</h3>
              <div className="resource-cards">
                {loading ? (
                  <div className="resource-loading">プレビューを読み込み中...</div>
                ) : (
                  resourcePreviews.map(resource => (
                    <a 
                      key={resource.id} 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="resource-card"
                    >
                      <div className={!resource.image ? "resource-card-no-image" : "resource-card-image"}>
                        {resource.image ? (
                          <img 
                            src={resource.image} 
                            alt={resource.title} 
                            loading="lazy" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentNode.className = 'resource-card-no-image';
                              const faviconUrl = `https://www.google.com/s2/favicons?domain=${resource.hostname}`;
                              const favicon = document.createElement('img');
                              favicon.src = faviconUrl;
                              favicon.className = 'resource-favicon';
                              const siteName = document.createElement('span');
                              siteName.textContent = resource.siteName || resource.hostname;
                              e.target.parentNode.innerHTML = '';
                              e.target.parentNode.appendChild(favicon);
                              e.target.parentNode.appendChild(siteName);
                            }}
                          />
                        ) : (
                          <>
                            <img 
                              src={`https://www.google.com/s2/favicons?domain=${resource.hostname}`} 
                              alt="" 
                              className="resource-favicon" 
                            />
                            <span>{resource.siteName || resource.hostname}</span>
                          </>
                        )}
                      </div>
                      <div className="resource-card-content">
                        <h4>{resource.title}</h4>
                        <p>{resource.description}</p>
                        <div className="resource-card-footer">
                          <span className="resource-type">{resource.type}</span>
                          <span className="resource-hostname">{resource.hostname}</span>
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </aside>
          ) : (
            <aside className="resource-sidebar">
              <h3>関連リソース</h3>
              <div className="resource-cards">
                <div>この問題には関連リソースがありません</div>
              </div>
            </aside>
          )}
        </div>
      </div>

      <footer className="footer">
        <p>© 2025 Focus-Engineering</p>
      </footer>
    </div>
  );
}

export async function getStaticPaths() {
  return {
    paths: getAllProblemPaths(),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const language = getLanguage(params.language);
  const problem = getProblem(params.language, params.id);
  const sidebarProblems = getProblemsByLanguage(params.language);
  const categories = getCategoriesByLanguage(params.language);
  
  if (!language || !problem) {
    return {
      notFound: true
    };
  }
  
  return {
    props: {
      language,
      problem,
      sidebarProblems,
      categories
    }
  };
}
