---
title: "テンプレートエンジン"
description: "Flaskでテンプレートエンジンを使用してHTMLページを生成する"
difficulty: "Medium"
category: "flask"
---

# テンプレートエンジン

## 問題

Flaskフレームワークとテンプレートエンジン（Jinja2）を使用して、以下の要件を満たすシンプルなブログ表示ページを実装してください：

1. GET `/` - ブログ記事の一覧を表示するホームページ
2. GET `/post/<int:post_id>` - 特定のブログ記事の詳細ページ

テンプレートは以下の要素を含める必要があります：
- 共通のヘッダーとフッター（ベーステンプレートを使用）
- 記事一覧ページでは、各記事のタイトルと概要を表示し、詳細ページへのリンクを設定
- 記事詳細ページでは、記事のタイトル、内容、投稿日時を表示し、一覧ページへ戻るリンクを設定

## ベースコード

```python
from flask import Flask, render_template

app = Flask(__name__)

# ダミーのブログ記事データ
blog_posts = [
    {
        'id': 1,
        'title': 'Flaskの基本',
        'content': 'Flaskは軽量なPythonのWebフレームワークです。シンプルで拡張性があり、小規模から中規模のWebアプリケーション開発に適しています。',
        'summary': 'Flaskの基本概念と特徴について解説します。',
        'created_at': '2023-01-01'
    },
    {
        'id': 2,
        'title': 'テンプレートエンジンの使い方',
        'content': 'Jinja2はPythonで最も広く使われているテンプレートエンジンの一つです。FlaskはデフォルトでJinja2を採用しており、HTMLテンプレートに動的なデータを埋め込むことができます。',
        'summary': 'FlaskでのJinja2テンプレートエンジンの活用方法を学びます。',
        'created_at': '2023-01-15'
    }
]

# ルートを実装してください

if __name__ == '__main__':
    app.run(debug=True)
```

## 解答例

```python
from flask import Flask, render_template, abort

app = Flask(__name__)

# ダミーのブログ記事データ
blog_posts = [
    {
        'id': 1,
        'title': 'Flaskの基本',
        'content': 'Flaskは軽量なPythonのWebフレームワークです。シンプルで拡張性があり、小規模から中規模のWebアプリケーション開発に適しています。',
        'summary': 'Flaskの基本概念と特徴について解説します。',
        'created_at': '2023-01-01'
    },
    {
        'id': 2,
        'title': 'テンプレートエンジンの使い方',
        'content': 'Jinja2はPythonで最も広く使われているテンプレートエンジンの一つです。FlaskはデフォルトでJinja2を採用しており、HTMLテンプレートに動的なデータを埋め込むことができます。',
        'summary': 'FlaskでのJinja2テンプレートエンジンの活用方法を学びます。',
        'created_at': '2023-01-15'
    }
]

# ホームページ（記事一覧）
@app.route('/')
def index():
    return render_template('index.html', posts=blog_posts)

# 記事詳細ページ
@app.route('/post/<int:post_id>')
def post_detail(post_id):
    post = next((post for post in blog_posts if post['id'] == post_id), None)
    if post is None:
        abort(404)
    return render_template('post.html', post=post)

# 404エラーハンドラ
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)
```

### テンプレートファイル

#### templates/base.html
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Flask Blog{% endblock %}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        header {
            background-color: #f5f5f5;
            padding: 10px;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }
        footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 0.8em;
            color: #777;
        }
        .post {
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        .post h2 {
            margin-bottom: 5px;
        }
        .post-meta {
            color: #777;
            font-size: 0.9em;
            margin-bottom: 10px;
        }
        .back-link {
            margin-top: 20px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <header>
        <h1>Flask Blog</h1>
        <nav>
            <a href="/">ホーム</a>
        </nav>
    </header>
    
    <main>
        {% block content %}{% endblock %}
    </main>
    
    <footer>
        <p>&copy; 2023 Flask Blog</p>
    </footer>
</body>
</html>
```

#### templates/index.html
```html
{% extends 'base.html' %}

{% block title %}ブログ記事一覧 | Flask Blog{% endblock %}

{% block content %}
    <h1>ブログ記事一覧</h1>
    
    {% for post in posts %}
        <div class="post">
            <h2><a href="{{ url_for('post_detail', post_id=post.id) }}">{{ post.title }}</a></h2>
            <div class="post-meta">投稿日: {{ post.created_at }}</div>
            <p>{{ post.summary }}</p>
            <a href="{{ url_for('post_detail', post_id=post.id) }}">続きを読む</a>
        </div>
    {% endfor %}
{% endblock %}
```

#### templates/post.html
```html
{% extends 'base.html' %}

{% block title %}{{ post.title }} | Flask Blog{% endblock %}

{% block content %}
    <article>
        <h1>{{ post.title }}</h1>
        <div class="post-meta">投稿日: {{ post.created_at }}</div>
        <div class="post-content">
            <p>{{ post.content }}</p>
        </div>
    </article>
    
    <a href="{{ url_for('index') }}" class="back-link">← 記事一覧に戻る</a>
{% endblock %}
```

#### templates/404.html
```html
{% extends 'base.html' %}

{% block title %}ページが見つかりません | Flask Blog{% endblock %}

{% block content %}
    <h1>404 - ページが見つかりません</h1>
    <p>お探しのページは存在しないか、移動した可能性があります。</p>
    <a href="{{ url_for('index') }}" class="back-link">ホームに戻る</a>
{% endblock %}
```
