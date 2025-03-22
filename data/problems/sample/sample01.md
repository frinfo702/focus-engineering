---
title: "基本的なルーティング"
description: "Flaskフレームワークで基本的なルーティングを実装する"
difficulty: "Easy"
category: "flask"
relatedResources:
  - title: "Flaskドキュメント - ルーティング"
    url: "https://flask.palletsprojects.com/en/2.0.x/quickstart/#routing"
    # description: "Flask公式ドキュメントのルーティング解説"
    type: "documentation"
  - title: "Flask GitHub"
    url: "https://github.com/pallets/flask"
    description: "Flask公式GitHubリポジトリ"
    type: "github"
  - title: "Pythonフレームワーク入門"
    url: "https://zenn.dev/topics/python"
    description: "Zennに投稿されたPython関連の記事一覧"
---

# サンプルマークダウンページ

## さまざまな要素のテスト

このページはマークダウンの様々な要素をテストするためのサンプルページです。

### リンクカードのテスト

以下はURLだけの行なので、自動的にカードとして表示されるはずです：

https://echo.labstack.com/

https://echo.labstack.com/docs/cookies

https://teenage.engineering/

### 通常のリンク

これは[通常のリンク](https://github.com/frinfo702/focus-engineering)で、カードにはなりません。

### リスト

- 項目1
- 項目2
  - ネストされた項目
  - もう一つのネスト
- 項目3

### コードブロック

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return '今日もいい天気ですね！'

if __name__ == '__main__':
    app.run(debug=True)
```

### 表

| 名前 | 説明 | バージョン |
|------|------|----------|
| Flask | Pythonのマイクロウェブフレームワーク | 2.0.x |
| Echo | Goの高性能ウェブフレームワーク | 4.x |
| Express | Node.jsのウェブフレームワーク | 4.x |

### 引用

> プログラミングは考え方であり、言語ではありません。
> - 著名なプログラマーの言葉

## オリジナルのコンテンツ

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
