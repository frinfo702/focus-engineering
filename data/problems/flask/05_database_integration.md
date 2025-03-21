---
title: "データベース連携"
description: "FlaskとSQLAlchemyを使用してデータベース操作を実装する"
difficulty: "Hard"
category: "flask"
---

# データベース連携

## 問題

FlaskとSQLAlchemyを使用して、シンプルなタスク管理アプリケーションのバックエンドAPIを実装してください。以下の要件を満たす必要があります：

1. タスクモデルを定義（id, title, description, completed, created_at）
2. 以下のエンドポイントを実装：
   - GET `/api/tasks` - すべてのタスクを取得
   - GET `/api/tasks/<id>` - 特定のタスクを取得
   - POST `/api/tasks` - 新しいタスクを作成
   - PUT `/api/tasks/<id>` - 既存のタスクを更新
   - DELETE `/api/tasks/<id>` - タスクを削除

## ベースコード

```python
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
# SQLiteデータベースを使用
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# タスクモデルを定義してください

# データベース初期化関数
@app.before_first_request
def create_tables():
    db.create_all()

# APIエンドポイントを実装してください

if __name__ == '__main__':
    app.run(debug=True)
```

## 解答例

```python
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
# SQLiteデータベースを使用
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# タスクモデル
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'created_at': self.created_at.isoformat()
        }

# データベース初期化関数
@app.before_first_request
def create_tables():
    db.create_all()

# すべてのタスクを取得
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])

# 特定のタスクを取得
@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify(task.to_dict())

# 新しいタスクを作成
@app.route('/api/tasks', methods=['POST'])
def create_task():
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    
    data = request.get_json()
    
    if 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400
    
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        completed=data.get('completed', False)
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify(task.to_dict()), 201

# タスクを更新
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'completed' in data:
        task.completed = data['completed']
    
    db.session.commit()
    
    return jsonify(task.to_dict())

# タスクを削除
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'message': f'Task {task_id} deleted successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)
```
