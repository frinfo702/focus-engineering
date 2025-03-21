// サーバーサイドのみで必要なモジュール
let fs;
let path;
if (typeof window === 'undefined') {
  fs = require('fs');
  path = require('path');
}

import matter from 'gray-matter';
import { renderMarkdown } from './markdown';

// 問題ディレクトリのパス（サーバーサイドでのみ使用）
const getProblemDirectory = () => {
  return path.join(process.cwd(), 'data/problems');
};

// カテゴリIDから表示名を生成（クライアント/サーバー両方で利用可能）
export function getCategoryName(categoryId) {
  const categoryNames = {
    'routing': 'ルーティング',
    'middleware': 'ミドルウェア',
    'json': 'JSONレスポンス',
    'templates': 'テンプレート',
    'template': 'テンプレート',
    'database': 'データベース連携',
    'async': '非同期処理',
    'dom': 'DOM操作'
  };
  
  return categoryNames[categoryId] || categoryId;
}

// ファイル名からカテゴリを推測する関数
function guessCategoryFromFilename(fileName) {
  // 01_routing_basic.md -> routing
  const match = fileName.match(/_([a-z]+)_/);
  if (match && match[1]) {
    return match[1];
  }
  
  // xx_json_response.md -> json
  if (fileName.includes('_json_')) return 'json';
  if (fileName.includes('_routing_')) return 'routing';
  if (fileName.includes('_template_')) return 'templates';
  if (fileName.includes('_database_')) return 'database';
  if (fileName.includes('_request_hooks_')) return 'middleware';
  
  return null;
}

// 特定の言語の全問題を取得（サーバーサイドでのみ実行可能）
export function getProblemsByLanguage(language) {
  if (typeof window !== 'undefined') {
    console.error('getProblemsByLanguage is server-side only');
    return [];
  }

  const problemsDirectory = getProblemDirectory();
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
    
    // カテゴリがない場合はファイル名から推測
    if (!matterResult.data.category) {
      const guessedCategory = guessCategoryFromFilename(fileName);
      if (guessedCategory) {
        matterResult.data.category = guessedCategory;
      }
    }
    
    // データをIDと一緒に返す
    return {
      id,
      language,
      ...matterResult.data
    };
  });
  
  // 難易度でソート (Easy -> Medium -> Hard)
  return allProblems.sort((a, b) => {
    const difficulties = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
    return (difficulties[a.difficulty] || 999) - (difficulties[b.difficulty] || 999);
  });
}

// 言語ごとのカテゴリ情報を生成（サーバーサイドでのみ実行可能）
export function getCategoriesByLanguage(language) {
  if (typeof window !== 'undefined') {
    console.error('getCategoriesByLanguage is server-side only');
    return [];
  }

  const problems = getProblemsByLanguage(language);
  
  // カテゴリの集合を作成
  const categoriesSet = new Set();
  problems.forEach(problem => {
    if (problem.category) {
      categoriesSet.add(problem.category);
    }
  });
  
  // カテゴリ情報の配列に変換
  const categories = Array.from(categoriesSet).map(categoryId => ({
    id: categoryId,
    name: getCategoryName(categoryId)
  }));
  
  return categories;
}

// 特定の問題を取得（サーバーサイドでのみ実行可能）
export function getProblem(language, id) {
  if (typeof window !== 'undefined') {
    console.error('getProblem is server-side only');
    return null;
  }

  const problemsDirectory = getProblemDirectory();
  const fullPath = path.join(problemsDirectory, language, `${id}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);
  
  // カテゴリがない場合はファイル名から推測
  if (!matterResult.data.category) {
    const guessedCategory = guessCategoryFromFilename(`${id}.md`);
    if (guessedCategory) {
      matterResult.data.category = guessedCategory;
    }
  }
  
  // カスタムレンダラーでMarkdownをHTMLに変換
  const content = renderMarkdown(matterResult.content);
  
  return {
    id,
    language,
    content,
    ...matterResult.data
  };
}

// 全ての言語と問題IDのパスを生成 (静的生成用)（サーバーサイドでのみ実行可能）
export function getAllProblemPaths() {
  if (typeof window !== 'undefined') {
    console.error('getAllProblemPaths is server-side only');
    return [];
  }

  const problemsDirectory = getProblemDirectory();
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
