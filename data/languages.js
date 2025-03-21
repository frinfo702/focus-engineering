const languages = [
  {
    id: 'echo',
    name: 'Echo (Go)',
    description: 'Goの高性能ウェブフレームワーク'
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    description: 'フレームワークなしの純粋なJavaScript'
  },
  {
    id: 'flask',
    name: 'Flask (Python)',
    description: 'Pythonの軽量ウェブフレームワーク'
  },
  {
    id: 'onepiece',
    name: 'ワンピース',
    description: 'ジャンプの看板漫画'
  }
];

export function getAllLanguages() {
  return languages;
}

export function getLanguage(id) {
  return languages.find(lang => lang.id === id) || null;
} 
