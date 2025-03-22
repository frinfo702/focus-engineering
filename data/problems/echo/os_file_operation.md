---
title: "ファイル操作の基本"
description: "osパッケージを使用した基本的なファイル操作"
difficulty: "Easy"
category: "標準ライブラリ"
subcategory: "os"
---

# ファイル操作の基本

## 問題

ファイル操作に関する以下の関数を実装してください：

1. `CreateFile`: 指定されたパスに新しいファイルを作成し、与えられた内容を書き込む関数
2. `ReadFile`: 指定されたパスのファイルの内容を読み込む関数
3. `FileExists`: 指定されたパスにファイルが存在するかどうかを確認する関数

## ベースコード

```go
package fileops

import (
	// 必要なパッケージをインポートしてください
)

// CreateFile は指定されたパスに新しいファイルを作成し、内容を書き込みます
func CreateFile(path string, content string) error {
	// ここに実装を書いてください
}

// ReadFile は指定されたパスのファイルの内容を読み込みます
func ReadFile(path string) (string, error) {
	// ここに実装を書いてください
}

// FileExists は指定されたパスにファイルが存在するかどうかを確認します
func FileExists(path string) bool {
	// ここに実装を書いてください
}
```

## 解答例

```go
package fileops

import (
	"os"
	"io/ioutil"
)

// CreateFile は指定されたパスに新しいファイルを作成し、内容を書き込みます
func CreateFile(path string, content string) error {
	// ファイルを作成（既存の場合は切り詰め）
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()
	
	// 内容を書き込み
	_, err = file.WriteString(content)
	return err
}

// ReadFile は指定されたパスのファイルの内容を読み込みます
func ReadFile(path string) (string, error) {
	// ファイルを読み込み
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return "", err
	}
	
	return string(data), nil
}

// FileExists は指定されたパスにファイルが存在するかどうかを確認します
func FileExists(path string) bool {
	// ファイル情報を取得
	_, err := os.Stat(path)
	
	// エラーがなければファイルは存在する
	// os.IsNotExist(err)はファイルが存在しない場合にtrueを返す
	return !os.IsNotExist(err)
}
```
