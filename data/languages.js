const languages = [
  {
    id: 'echo',
    name: 'Echo (Go)',
    description: 'Goの高性能ウェブフレームワーク',
    categories: [
      { id: 'middleware', name: 'ミドルウェア' },
      { id: 'routing', name: 'ルーティング' }
    ]
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    description: 'フレームワークなしの純粋なJavaScript',
    categories: [
      { id: 'async', name: '非同期処理' },
      { id: 'dom', name: 'DOM操作' }
    ]
  }
];

export function getAllLanguages() {
  return languages;
}

export function getLanguage(id) {
  return languages.find(lang => lang.id === id) || null;
} 
