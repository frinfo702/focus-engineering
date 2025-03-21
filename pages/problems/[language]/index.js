import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAllLanguages, getLanguage } from '../../../data/languages';
import { getProblemsByLanguage, getCategoriesByLanguage } from '../../../lib/problems';

export default function LanguageProblems({ language, problems, categories }) {
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
        <h1>{language.name}</h1>
        <p>{language.description}</p>
        
        {categories.map(category => {
          const categoryProblems = problems.filter(p => p.category === category.id);
          if (categoryProblems.length === 0) return null;
          
          return (
            <section key={category.id}>
              <h2>{category.name}</h2>
              <div className="problem-grid">
                {categoryProblems.map(problem => (
                  <Link 
                    href={`/problems/${language.id}/${problem.id}`} 
                    key={problem.id}
                  >
                    <div className="problem-card">
                      <h3>{problem.title || problem.id}</h3>
                      <p>{problem.description || ''}</p>
                      {problem.difficulty && (
                        <span className="difficulty" data-level={problem.difficulty}>{problem.difficulty}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
        
        {/* 未分類の問題 */}
        {(() => {
          const uncategorizedProblems = problems.filter(p => !p.category);
          
          if (uncategorizedProblems.length === 0) return null;
          
          return (
            <section>
              <h2>未分類</h2>
              <div className="problem-grid">
                {uncategorizedProblems.map(problem => (
                  <Link 
                    href={`/problems/${language.id}/${problem.id}`} 
                    key={problem.id}
                  >
                    <div className="problem-card">
                      <h3>{problem.title || problem.id}</h3>
                      <p>{problem.description || ''}</p>
                      {problem.difficulty && (
                        <span className="difficulty" data-level={problem.difficulty}>{problem.difficulty}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })()}
      </div>

      <footer className="footer">
        <p>© 2025 Focus-Engineering</p>
      </footer>
    </div>
  );
}

export async function getStaticPaths() {
  const languages = getAllLanguages();
  const paths = languages.map(lang => ({
    params: { language: lang.id }
  }));
  
  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const language = getLanguage(params.language);
  const problems = getProblemsByLanguage(params.language);
  const categories = getCategoriesByLanguage(params.language);
  
  if (!language) {
    return {
      notFound: true
    };
  }
  
  return {
    props: {
      language,
      problems,
      categories
    }
  };
} 
