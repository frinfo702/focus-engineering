---
title: "同期プリミティブの基本"
description: "syncパッケージを使用した並行処理の同期"
difficulty: "Medium"
category: "標準ライブラリ"
subcategory: "sync"
---

# 同期プリミティブの基本

## 問題

syncパッケージを使用して、以下の同期関連の関数を実装してください：

1. `SafeCounter`: 複数のゴルーチンから安全にアクセスできるカウンター構造体とそのメソッド
2. `RunConcurrently`: 指定された関数を複数のゴルーチンで並行実行し、すべての完了を待つ関数
3. `LimitedConcurrency`: 同時実行数を制限しながら複数のタスクを実行する関数

## ベースコード

```go
package syncops

import (
	// 必要なパッケージをインポートしてください
)

// SafeCounter は複数のゴルーチンから安全にアクセスできるカウンターです
type SafeCounter struct {
	// 必要なフィールドを定義してください
}

// Increment はカウンターの値を1増やします
func (c *SafeCounter) Increment() {
	// ここに実装を書いてください
}

// Value はカウンターの現在値を返します
func (c *SafeCounter) Value() int {
	// ここに実装を書いてください
}

// RunConcurrently は指定された関数を複数のゴルーチンで並行実行し、すべての完了を待ちます
func RunConcurrently(fn func(int), count int) {
	// ここに実装を書いてください
}

// LimitedConcurrency は同時実行数を制限しながら複数のタスクを実行します
func LimitedConcurrency(tasks []func(), maxConcurrency int) {
	// ここに実装を書いてください
}
```

## 解答例

```go
package syncops

import (
	"sync"
)

// SafeCounter は複数のゴルーチンから安全にアクセスできるカウンターです
type SafeCounter struct {
	mu    sync.Mutex
	value int
}

// Increment はカウンターの値を1増やします
func (c *SafeCounter) Increment() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.value++
}

// Value はカウンターの現在値を返します
func (c *SafeCounter) Value() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.value
}

// RunConcurrently は指定された関数を複数のゴルーチンで並行実行し、すべての完了を待ちます
func RunConcurrently(fn func(int), count int) {
	var wg sync.WaitGroup
	
	// 指定された数のゴルーチンを起動
	for i := 0; i < count; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			fn(id)
		}(i)
	}
	
	// すべてのゴルーチンの完了を待つ
	wg.Wait()
}

// LimitedConcurrency は同時実行数を制限しながら複数のタスクを実行します
func LimitedConcurrency(tasks []func(), maxConcurrency int) {
	var wg sync.WaitGroup
	
	// セマフォとして使用するチャネルを作成
	semaphore := make(chan struct{}, maxConcurrency)
	
	// すべてのタスクを実行
	for _, task := range tasks {
		wg.Add(1)
		
		// タスクをクロージャでキャプチャ
		taskFn := task
		
		go func() {
			defer wg.Done()
			
			// セマフォを取得
			semaphore <- struct{}{}
			
			// タスクを実行
			taskFn()
			
			// セマフォを解放
			<-semaphore
		}()
	}
	
	// すべてのタスクの完了を待つ
	wg.Wait()
}
```
