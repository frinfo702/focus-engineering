---
title: "リクエストフック"
description: "Flaskでリクエスト前後の処理を行うデコレータを実装する"
difficulty: "Medium"
category: "flask"
---

# リクエストフック

## 問題

Flaskフレームワークで、以下の要件を満たすリクエストフック（デコレータ）を実装してください：

1. リクエスト前に実行される `before_request` フックで、リクエストの開始時間を記録する
2. リクエスト後に実行される `after_request` フックで、以下の情報をログに記録する：
   - リクエストのメソッド
   - リクエストのパス
   - レスポンスのステータスコード
   - リクエスト処理にかかった時間（ミリ秒）

ログは以下のフォーマットで出力してください：
```
[INFO] 2023/01/01 12:00:00 | GET /api/users | 200 | 10ms
```

## ベースコード

```python
import time
from datetime import datetime
from flask import Flask, request, g

app = Flask(__name__)

# リクエストフックを実装してください

# テスト用ルート
@app.route('/')
def index():
    return 'Hello, World!'

@app.route('/api/users')
def get_users():
    # 処理時間をシミュレート
    time.sleep(0.1)
    return '{"users": ["user1", "user2"]}'

@app.route('/api/error')
def error():
    return 'Error occurred', 500

if __name__ == '__main__':
    app.run(debug=True)
```

## 解答例

```python
import time
from datetime import datetime
from flask import Flask, request, g

app = Flask(__name__)

# リクエスト前に実行されるフック
@app.before_request
def before_request():
    # リクエスト開始時間を記録
    g.start_time = time.time()

# リクエスト後に実行されるフック
@app.after_request
def after_request(response):
    # 処理時間を計算（ミリ秒）
    duration_ms = int((time.time() - g.start_time) * 1000)
    
    # 現在時刻をフォーマット
    current_time = datetime.now().strftime('%Y/%m/%d %H:%M:%S')
    
    # ログ出力
    app.logger.info(
        f'[INFO] {current_time} | {request.method} {request.path} | {response.status_code} | {duration_ms}ms'
    )
    
    return response

# テスト用ルート
@app.route('/')
def index():
    return 'Hello, World!'

@app.route('/api/users')
def get_users():
    # 処理時間をシミュレート
    time.sleep(0.1)
    return '{"users": ["user1", "user2"]}'

@app.route('/api/error')
def error():
    return 'Error occurred', 500

if __name__ == '__main__':
    app.run(debug=True)
```
