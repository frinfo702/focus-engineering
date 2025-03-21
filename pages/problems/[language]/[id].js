import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAllLanguages, getLanguage } from '../../../data/languages';
import { getProblem, getProblemsByLanguage, getAllProblemPaths, getCategoriesByLanguage, getCategoryName } from '../../../lib/problems';

export default function Problem({ language, problem, sidebarProblems, categories }) {
  const router = useRouter();
  
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
            
            <div className="problem-content">
              <div dangerouslySetInnerHTML={{ __html: problem.content }} />
            </div>
          </main>
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
