import { useRouter } from 'next/router';
import Link from 'next/link';
import { getLanguage, getAllLanguages } from '../../data/languages';
import { getProblemsByLanguage } from '../../lib/problems';

export default function LanguageProblems({ language, problems }) {
  const router = useRouter();
  
  if (router.isFallback) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <header className="header">
        <h1 className="logo">エンジニア学習プラットフォーム</h1>
        <nav>
          <Link href="/">ホーム</Link>
        </nav>
      </header>

      <div className="container">
        <h1>{language.name}の問題一覧</h1>
        
        {language.categories.map(category => (
          <section key={category.id}>
            <h2>{category.name}</h2>
            <div className="problem-grid">
              {problems
                .filter(problem => problem.category === category.id)
                .map(problem => (
                  <Link href={`/problems/${language.id}/${problem.id}`} key={problem.id}>
                    <div className="problem-card">
                      <h3>{problem.title}</h3>
                      <p>{problem.description}</p>
                      <div className="difficulty" data-level={problem.difficulty}>{problem.difficulty}</div>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="footer">
        <p>© 2023 エンジニア学習プラットフォーム</p>
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
  
  if (!language) {
    return {
      notFound: true
    };
  }
  
  return {
    props: {
      language,
      problems
    }
  };
}
