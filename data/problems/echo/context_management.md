---
title: "コンテキスト管理"
description: "contextパッケージを使用したコンテキスト管理"
difficulty: "Medium"
category: "標準ライブラリ"
subcategory: "context"
---

# コンテキスト管理

## 問題

contextパッケージを使用して、以下のコンテキスト関連の関数を実装してください：

1. `WithTimeout`: 指定された時間後にキャンセルされるコンテキストを作成し、そのコンテキストを使用してタスクを実行する関数
2. `WithCancel`: 明示的にキャンセル可能なコンテキストを作成し、そのコンテキストを使用してタスクを実行する関数
3. `WithValue`: コンテキストに値を設定し、その値を取得する関数

## ベースコード

```go
package contextops

import (
	// 必要なパッケージをインポートしてください
)

// WithTimeout は指定された時間後にキャンセルされるコンテキストを使用してタスクを実行します
func WithTimeout(task func(ctx context.Context) error, timeout time.Duration) error {
	// ここに実装を書いてください
}

// WithCancel は明示的にキャンセル可能なコンテキストを使用してタスクを実行します
// キャンセル関数を返します
func WithCancel(task func(ctx context.Context) error) (cancel func(), err error) {
	// ここに実装を書いてください
}

// WithValue はコンテキストに値を設定し、その値を取得します
func WithValue(ctx context.Context, key, val interface{}) (retrievedVal interface{}) {
	// ここに実装を書いてください
}
```

## 解答例

```go
package contextops

import (
	"context"
	"time"
)

// WithTimeout は指定された時間後にキャンセルされるコンテキストを使用してタスクを実行します
func WithTimeout(task func(ctx context.Context) error, timeout time.Duration) error {
	// タイムアウト付きのコンテキストを作成
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel() // 関数終了時にキャンセル関数を呼び出す
	
	// タスクを実行
	return task(ctx)
}

// WithCancel は明示的にキャンセル可能なコンテキストを使用してタスクを実行します
// キャンセル関数を返します
func WithCancel(task func(ctx context.Context) error) (cancel func(), err error) {
	// キャンセル可能なコンテキストを作成
	ctx, cancel := context.WithCancel(context.Background())
	
	// タスクを実行
	err = task(ctx)
	
	// キャンセル関数を返す
	return cancel, err
}

// WithValue はコンテキストに値を設定し、その値を取得します
func WithValue(ctx context.Context, key, val interface{}) (retrievedVal interface{}) {
	// 値を持つコンテキストを作成
	valueCtx := context.WithValue(ctx, key, val)
	
	// コンテキストから値を取得
	retrievedVal = valueCtx.Value(key)
	
	return retrievedVal
}
```
