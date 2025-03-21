---
title: "非同期処理の基本"
description: "JavaScriptのPromiseを使った非同期処理の基本を学ぶ"
difficulty: "Easy"
category: "async"
---

# 非同期処理の基本

## 問題

次のコードは、APIからユーザーデータを取得し、そのユーザーの投稿を取得する関数です。
現在のコードには非同期処理の問題があり、常に空の配列が返されてしまいます。
Promise (then/catch) または async/await を使って、正しく動作するように修正してください。

- `getUserData`関数は指定されたIDのユーザー情報を取得します
- `getUserPosts`関数はユーザーのIDを元に、そのユーザーの投稿を取得します
- `fetchUserDataAndPosts`関数は上記2つの関数を使ってユーザー情報と投稿を取得し、結合して返します

## ベースコード

```javascript
// APIからユーザーデータを取得する関数（モック）
function getUserData(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: userId, name: 'ユーザー' + userId });
    }, 1000);
  });
}

// ユーザーの投稿を取得する関数（モック）
function getUserPosts(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, userId: userId, title: '投稿1' },
        { id: 2, userId: userId, title: '投稿2' }
      ]);
    }, 1000);
  });
}

// ユーザーデータと投稿を取得する関数（問題のある実装）
function fetchUserDataAndPosts(userId) {
  let userData = null;
  let posts = [];
  
  getUserData(userId);
  getUserPosts(userId);
  
  return {
    user: userData,
    posts: posts
  };
}

// テスト
console.log('開始');
const result = fetchUserDataAndPosts(1);
console.log(result);  // { user: null, posts: [] } が出力される
console.log('終了');
```

## 解答例

```javascript
// APIからユーザーデータを取得する関数（モック）
function getUserData(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: userId, name: 'ユーザー' + userId });
    }, 1000);
  });
}

// ユーザーの投稿を取得する関数（モック）
function getUserPosts(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, userId: userId, title: '投稿1' },
        { id: 2, userId: userId, title: '投稿2' }
      ]);
    }, 1000);
  });
}

// 解答例1: Promise.thenを使った実装
function fetchUserDataAndPosts(userId) {
  return getUserData(userId)
    .then(userData => {
      return getUserPosts(userId)
        .then(posts => {
          return {
            user: userData,
            posts: posts
          };
        });
    });
}

// 解答例2: async/awaitを使った実装
// async function fetchUserDataAndPosts(userId) {
//   const userData = await getUserData(userId);
//   const posts = await getUserPosts(userId);
//   
//   return {
//     user: userData,
//     posts: posts
//   };
// }

// 解答例3: Promise.allを使った並列処理
// async function fetchUserDataAndPosts(userId) {
//   const [userData, posts] = await Promise.all([
//     getUserData(userId),
//     getUserPosts(userId)
//   ]);
//   
//   return {
//     user: userData,
//     posts: posts
//   };
// }

// テスト
console.log('開始');
fetchUserDataAndPosts(1).then(result => {
  console.log(result);  // { user: { id: 1, name: 'ユーザー1' }, posts: [...] }
});
console.log('終了');
```

## ヒント

1. JavaScriptのPromiseは非同期処理の結果を表すオブジェクトです
2. Promise関数の戻り値を受け取るには`.then()`を使うか、`async/await`構文を使います
3. 複数の非同期処理を順番に実行する場合は、Promiseチェーンや`await`を使った直列処理が有効です
4. 複数の非同期処理を同時に実行する場合は、`Promise.all()`を使うと効率的です 
