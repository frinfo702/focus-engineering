import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { renderMarkdown } from './markdown';

const problemsDirectory = path.join(process.cwd(), 'data/problems');

// 特定の言語の全問題を取得
export function getProblemsByLanguage(language) {
  const languageDir = path.join(problemsDirectory, language);
  if (!fs.existsSync(languageDir)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(languageDir);
  
  const allProblems = fileNames.map(fileName => {
    // 拡張子を除外してIDとして使用
    const id = fileName.replace(/\.md$/, '');
    
    // Markdownの内容を読み込む
    const fullPath = path.join(languageDir, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    // gray-matterでフロントマターを解析
    const matterResult = matter(fileContents);
    
    // データをIDと一緒に返す
    return {
      id,
      language,
      ...matterResult.data
    };
  });
  
  // 難易度でソート (初級 -> 中級 -> 上級)
  return allProblems.sort((a, b) => {
    const difficulties = { '初級': 1, '中級': 2, '上級': 3 };
    return difficulties[a.difficulty] - difficulties[b.difficulty];
  });
}

// 特定の問題を取得
export function getProblem(language, id) {
  const fullPath = path.join(problemsDirectory, language, `${id}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);
  
  // カスタムレンダラーでMarkdownをHTMLに変換
  const content = renderMarkdown(matterResult.content);
  
  return {
    id,
    language,
    content,
    ...matterResult.data
  };
}

// 全ての言語と問題IDのパスを生成 (静的生成用)
export function getAllProblemPaths() {
  const languages = fs.readdirSync(problemsDirectory);
  
  const paths = [];
  
  languages.forEach(language => {
    const languagePath = path.join(problemsDirectory, language);
    if (fs.statSync(languagePath).isDirectory()) {
      const problems = fs.readdirSync(languagePath)
        .filter(file => file.endsWith('.md'))
        .map(file => ({
          params: {
            language,
            id: file.replace(/\.md$/, '')
          }
        }));
      
      paths.push(...problems);
    }
  });
  
  return paths;
}
