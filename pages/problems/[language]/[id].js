import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect } from 'react';
import Prism from 'prismjs';
import { getLanguage } from '../../../data/languages';
import { getProblem, getProblemsByLanguage, getAllProblemPaths } from '../../../lib/problems';

export default function Problem({ language, problem, sidebarProblems }) {
  const router = useRouter();
  
  useEffect(() => {
    // ページ遷移後にコードをハイライト
    Prism.highlightAll();
  }, [problem]);
  
  if (router.isFallback) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <header className="header">
        <h1 className="logo">エンジニア学習プラットフォーム</h1>
        <nav>
          <Link href="/">ホーム</Link>
          <Link href={`/problems/${language.id}`}>{language.name}</Link>
        </nav>
      </header>

      <div className="container">
        <div className="problem-layout">
          {/* サイドバー */}
          <aside className="problem-sidebar">
            <h3>{language.name}の問題一覧</h3>
            <ul className="sidebar-problem-list">
              {language.categories.map(category => (
                <li key={category.id} className="sidebar-category">
                  <h4>{category.name}</h4>
                  <ul>
                    {sidebarProblems
                      .filter(p => p.category === category.id)
                      .map(p => (
                        <li key={p.id} className={p.id === problem.id ? 'active' : ''}>
                          <Link href={`/problems/${language.id}/${p.id}`}>
                            {p.title}
                            <span className="sidebar-difficulty" data-level={p.difficulty}>{p.difficulty}</span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
          </aside>
          
          {/* メインコンテンツ */}
          <main className="problem-main">
            <div className="problem-header">
              <h1>{problem.title}</h1>
              <div className="tags">
                <span className="difficulty" data-level={problem.difficulty}>{problem.difficulty}</span>
                <span className="category">{
                  language.categories.find(c => c.id === problem.category)?.name
                }</span>
              </div>
            </div>
            
            <div className="problem-content">
              <div dangerouslySetInnerHTML={{ __html: problem.content }} />
            </div>
          </main>
        </div>
      </div>

      <footer className="footer">
        <p>© 2023 エンジニア学習プラットフォーム</p>
      </footer>
    </div>
  );
}

export async function getStaticPaths() {
  const paths = getAllProblemPaths();
  
  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const language = getLanguage(params.language);
  const problem = getProblem(params.language, params.id);
  
  // サイドバー用に同じ言語の問題一覧を取得
  const sidebarProblems = getProblemsByLanguage(params.language);
  
  if (!language || !problem) {
    return {
      notFound: true
    };
  }
  
  return {
    props: {
      language,
      problem,
      sidebarProblems
    }
  };
}
