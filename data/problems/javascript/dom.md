---
title: "DOM操作による要素の追加"
description: "DOMを操作して動的に要素を追加・削除する"
difficulty: "Medium"
category: "dom"
---

# DOM操作による要素の追加

## 問題

JavaScriptを使って、以下の機能を実装してください：

1. 「タスクを追加」ボタンをクリックすると、入力フィールドの内容がタスクリストに追加される
2. 各タスクの横に「削除」ボタンがあり、クリックするとそのタスクが削除される
3. 空のタスクは追加できないようにする
4. タスクをクリックすると、そのタスクに取り消し線がつく（完了状態のトグル）

## ベースコード

```html
<!DOCTYPE html>
<html>
<head>
  <title>シンプルToDoリスト</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .todo-container {
      margin-top: 20px;
    }
    
    .input-group {
      display: flex;
      margin-bottom: 20px;
    }
    
    #taskInput {
      flex-grow: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px 0 0 4px;
    }
    
    button {
      padding: 8px 15px;
      background-color: #4CAF50;
      color: white;
      border: none;
      cursor: pointer;
    }
    
    #addTask {
      border-radius: 0 4px 4px 0;
    }
    
    ul {
      list-style-type: none;
      padding: 0;
    }
    
    li {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    
    li span {
      cursor: pointer;
    }
    
    .completed {
      text-decoration: line-through;
      color: #888;
    }
    
    .delete-btn {
      background-color: #f44336;
      color: white;
      border: none;
      padding: 2px 6px;
      border-radius: 3px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h1>シンプルToDoリスト</h1>
  
  <div class="input-group">
    <input type="text" id="taskInput" placeholder="新しいタスクを入力...">
    <button id="addTask">タスクを追加</button>
  </div>
  
  <div class="todo-container">
    <h2>タスク一覧</h2>
    <ul id="taskList"></ul>
  </div>

  <script>
    // ここにコードを実装してください
  </script>
</body>
</html>
```

## 解答例

```javascript
// 必要な要素の取得
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTask');
const taskList = document.getElementById('taskList');

// タスク追加ボタンのクリックイベント
addTaskButton.addEventListener('click', function() {
  addTask();
});

// Enter キーでもタスク追加できるように
taskInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    addTask();
  }
});

// タスクを追加する関数
function addTask() {
  const taskText = taskInput.value.trim();
  
  // 空のタスクは追加しない
  if (taskText === '') {
    alert('タスクを入力してください');
    return;
  }
  
  // 新しいタスク要素を作成
  const li = document.createElement('li');
  
  // タスクテキスト用のspan要素
  const taskSpan = document.createElement('span');
  taskSpan.textContent = taskText;
  taskSpan.addEventListener('click', function() {
    // クリックでタスクの完了・未完了を切り替え
    this.classList.toggle('completed');
  });
  
  // 削除ボタン
  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-btn');
  deleteButton.textContent = '削除';
  deleteButton.addEventListener('click', function() {
    // 親要素（li）を削除
    li.remove();
  });
  
  // 要素の追加
  li.appendChild(taskSpan);
  li.appendChild(deleteButton);
  taskList.appendChild(li);
  
  // 入力フィールドをクリア
  taskInput.value = '';
  
  // フォーカスを入力フィールドに戻す
  taskInput.focus();
}
```
