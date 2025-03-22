---
title: "ロギングの基本"
description: "logパッケージを使用した基本的なロギング"
difficulty: "Easy"
category: "標準ライブラリ"
subcategory: "log"
---

# ロギングの基本

## 問題

logパッケージを使用して、以下のロギング関連の関数を実装してください：

1. `SetupFileLogger`: ログをファイルに出力するようにロガーを設定する関数
2. `LogLevels`: 異なるログレベル（INFO、WARNING、ERROR）でメッセージを出力する関数
3. `LogWithTimestamp`: タイムスタンプ付きでログを出力する関数

## ベースコード

```go
package logging

import (
	// 必要なパッケージをインポートしてください
)

// SetupFileLogger はログをファイルに出力するようにロガーを設定します
func SetupFileLogger(filePath string) (*log.Logger, error) {
	// ここに実装を書いてください
}

// LogLevels は異なるログレベルでメッセージを出力します
func LogLevels(logger *log.Logger, message string) {
	// ここに実装を書いてください
}

// LogWithTimestamp はタイムスタンプ付きでログを出力します
func LogWithTimestamp(message string) {
	// ここに実装を書いてください
}
```

## 解答例

```go
package logging

import (
	"log"
	"os"
	"time"
)

// SetupFileLogger はログをファイルに出力するようにロガーを設定します
func SetupFileLogger(filePath string) (*log.Logger, error) {
	// ログファイルを開く（存在しない場合は作成）
	file, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return nil, err
	}
	
	// ファイルに出力するロガーを作成
	logger := log.New(file, "", log.LstdFlags)
	
	return logger, nil
}

// LogLevels は異なるログレベルでメッセージを出力します
func LogLevels(logger *log.Logger, message string) {
	// 各レベルでログを出力
	logger.Printf("[INFO] %s", message)
	logger.Printf("[WARNING] %s", message)
	logger.Printf("[ERROR] %s", message)
}

// LogWithTimestamp はタイムスタンプ付きでログを出力します
func LogWithTimestamp(message string) {
	// 現在時刻を取得
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	
	// タイムスタンプ付きでログを出力
	log.Printf("[%s] %s", timestamp, message)
}
```
