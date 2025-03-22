---
title: "基本的なルーティング"
description: "Flaskフレームワークで基本的なルーティングを実装する"
difficulty: "Easy"
category: "flask"
relatedResources:
  - title: "Flaskドキュメント - ルーティング"
    url: "https://flask.palletsprojects.com/en/2.0.x/quickstart/#routing"
    description: "Flask公式ドキュメントのルーティング解説"
    type: "documentation"
  - title: "Flask Web開発入門"
    url: "https://github.com/pallets/flask"
    description: "Flask GitHubリポジトリ"
    type: "github"
  - title: "Flaskルーティングの実践的活用法"
    url: "https://zenn.dev"
    description: "Flaskアプリケーション開発におけるルーティングのベストプラクティス"
    type: "article"
---

# 基本的なルーティング

## 問題

Flaskフレームワークを使用して、以下の要件を満たすAPIエンドポイントを実装してください：

1. GET `/` - "Hello, World!"というテキストを返す
2. GET `/user/<username>` - パスパラメータとして渡されたユーザー名を含む "Hello, {username}!" というテキストを返す
3. GET `/query` - クエリパラメータ `name` の値を含む "Hello, {name}!" というテキストを返す（nameが指定されていない場合は "Hello, Guest!" を返す）

## ベースコード

```python
from flask import Flask, request

app = Flask(__name__)

# ここにルートを実装してください

if __name__ == '__main__':
    app.run(debug=True)
```

## 解答例

```python
from flask import Flask, request

app = Flask(__name__)

# 1. 基本的なGETエンドポイント
@app.route('/')
def hello_world():
    return 'Hello, World!'

# 2. パスパラメータを使用したエンドポイント
@app.route('/user/<username>')
def hello_user(username):
    return f'Hello, {username}!'

# 3. クエリパラメータを使用したエンドポイント
@app.route('/query')
def hello_query():
    name = request.args.get('name', 'Guest')
    return f'Hello, {name}!'

if __name__ == '__main__':
    app.run(debug=True)
```
