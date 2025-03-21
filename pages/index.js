import Link from 'next/link';
import { getAllLanguages } from '../data/languages';

export default function Home() {
  const languages = getAllLanguages();

  return (
    <div>
      <header className="header">
        <h1 className="logo">Focus-Engineering</h1>
        <nav>
          <a href="/">ホーム</a>
        </nav>
      </header>

      <div className="container">
        <section id="languages">
          <h2>言語・フレームワーク</h2>
          <div className="language-grid">
            {languages.map((lang) => (
              <Link href={`/problems/${lang.id}`} key={lang.id}>
                <div className="language-card">
                  <h3>{lang.name}</h3>
                  <p>{lang.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <footer className="footer">
        <p>© 2025 Focus-Engineering</p>
      </footer>
    </div>
  );
}
