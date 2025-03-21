---
title: "JSONレスポンス処理"
description: "Flaskフレームワークでリクエストデータを処理しJSONレスポンスを返す"
difficulty: "Easy"
---

# JSONレスポンス処理

## 問題

Flaskフレームワークを使用して、ユーザー情報を扱うAPIエンドポイントを実装してください。以下の要件を満たす必要があります：

1. GET `/api/users` - 事前定義されたユーザーリストをJSON形式で返す
2. GET `/api/users/<id>` - 指定されたIDのユーザー情報をJSON形式で返す（存在しない場合は404エラー）
3. POST `/api/users` - 新しいユーザー情報をリクエストボディから受け取り、IDを自動生成して追加し、追加されたユーザー情報をJSON形式で返す

## ベースコード

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

# ユーザーデータを保持するリスト
users = [
    {"id": 1, "name": "田中太郎", "age": 25},
    {"id": 2, "name": "鈴木花子", "age": 30}
]

# ここにルートを実装してください

if __name__ == '__main__':
    app.run(debug=True)
```

## 解答例

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

# ユーザーデータを保持するリスト
users = [
    {"id": 1, "name": "田中太郎", "age": 25},
    {"id": 2, "name": "鈴木花子", "age": 30}
]

# 1. 全ユーザーリストを返すエンドポイント
@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify(users)

# 2. 特定のユーザー情報を返すエンドポイント
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = next((user for user in users if user["id"] == user_id), None)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)

# 3. 新しいユーザーを追加するエンドポイント
@app.route('/api/users', methods=['POST'])
def create_user():
    if not request.is_json:
        return jsonify({"error": "Invalid request, JSON required"}), 400
    
    data = request.get_json()
    
    # 必須フィールドの確認
    if not all(key in data for key in ["name", "age"]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # 新しいIDを生成（単純に最後のID + 1）
    new_id = users[-1]["id"] + 1 if users else 1
    
    # 新しいユーザーを作成
    new_user = {
        "id": new_id,
        "name": data["name"],
        "age": data["age"]
    }
    
    # ユーザーをリストに追加
    users.append(new_user)
    
    return jsonify(new_user), 201

if __name__ == '__main__':
    app.run(debug=True)
```
