---
title: "非同期データ取得"
description: "fetch APIを使用して外部APIからデータを取得し表示する"
difficulty: "Easy"
category: "async"
---

# 非同期データ取得

## 問題

JavaScriptのfetch APIを使用して、指定されたAPIエンドポイントからユーザーデータを取得し、画面に表示するコードを実装してください。

要件：
1. ボタンをクリックしたときにデータを取得する
2. 取得中は「読み込み中...」と表示する
3. 取得したデータをリスト形式で表示する
4. エラーが発生した場合は「エラーが発生しました」と表示する

## ベースコード

```html
<!DOCTYPE html>
<html>
<head>
  <title>非同期データ取得</title>
  <style>
    .loading { color: blue; }
    .error { color: red; }
    .user-item { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
  </style>
</head>
<body>
  <h1>ユーザーリスト</h1>
  <button id="fetchButton">データを取得</button>
  <div id="result"></div>

  <script>
    // ここにコードを実装してください
  </script>
</body>
</html>
```

## 解答例

```html
<!DOCTYPE html>
<html>
<head>
  <title>非同期データ取得</title>
  <style>
    .loading { color: blue; }
    .error { color: red; }
    .user-item { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
  </style>
</head>
<body>
  <h1>ユーザーリスト</h1>
  <button id="fetchButton">データを取得</button>
  <div id="result"></div>

  <script>
    document.getElementById('fetchButton').addEventListener('click', fetchUsers);

    async function fetchUsers() {
      const resultDiv = document.getElementById('result');
      
      try {
        // 読み込み中表示
        resultDiv.innerHTML = '<p class="loading">読み込み中...</p>';
        
        // データ取得
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        
        if (!response.ok) {
          throw new Error('APIからのレスポンスが正常ではありません');
        }
        
        const users = await response.json();
        
        // 結果表示
        resultDiv.innerHTML = '<h2>ユーザー一覧</h2>';
        const userList = document.createElement('div');
        
        users.forEach(user => {
          const userItem = document.createElement('div');
          userItem.className = 'user-item';
          userItem.innerHTML = `
            <h3>${user.name}</h3>
            <p>Email: ${user.email}</p>
            <p>会社: ${user.company.name}</p>
          `;
          userList.appendChild(userItem);
        });
        
        resultDiv.appendChild(userList);
        
      } catch (error) {
        // エラー表示
        resultDiv.innerHTML = `<p class="error">エラーが発生しました: ${error.message}</p>`;
      }
    }
  </script>
</body>
</html>
```
