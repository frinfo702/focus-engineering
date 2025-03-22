---
title: "ファイルパス操作"
description: "path/filepathパッケージを使用したファイルパスの操作"
difficulty: "Easy"
category: "標準ライブラリ"
subcategory: "path/filepath"
---

# ファイルパス操作

## 問題

path/filepathパッケージを使用して、以下のファイルパス操作関数を実装してください：

1. `JoinPaths`: 複数のパス要素を結合して1つのパスを作成する関数
2. `GetExtension`: ファイルパスから拡張子を取得する関数
3. `IsAbsolutePath`: パスが絶対パスかどうかを判定する関数
4. `FindFilesWithExt`: 指定されたディレクトリ内で特定の拡張子を持つすべてのファイルを検索する関数

## ベースコード

```go
package pathops

import (
	// 必要なパッケージをインポートしてください
)

// JoinPaths は複数のパス要素を結合して1つのパスを作成します
func JoinPaths(elements ...string) string {
	// ここに実装を書いてください
}

// GetExtension はファイルパスから拡張子を取得します
func GetExtension(path string) string {
	// ここに実装を書いてください
}

// IsAbsolutePath はパスが絶対パスかどうかを判定します
func IsAbsolutePath(path string) bool {
	// ここに実装を書いてください
}

// FindFilesWithExt は指定されたディレクトリ内で特定の拡張子を持つすべてのファイルを検索します
func FindFilesWithExt(dir, ext string) ([]string, error) {
	// ここに実装を書いてください
}
```

## 解答例

```go
package pathops

import (
	"os"
	"path/filepath"
	"strings"
)

// JoinPaths は複数のパス要素を結合して1つのパスを作成します
func JoinPaths(elements ...string) string {
	return filepath.Join(elements...)
}

// GetExtension はファイルパスから拡張子を取得します
func GetExtension(path string) string {
	return filepath.Ext(path)
}

// IsAbsolutePath はパスが絶対パスかどうかを判定します
func IsAbsolutePath(path string) bool {
	return filepath.IsAbs(path)
}

// FindFilesWithExt は指定されたディレクトリ内で特定の拡張子を持つすべてのファイルを検索します
func FindFilesWithExt(dir, ext string) ([]string, error) {
	var result []string
	
	// 拡張子が.で始まることを確認
	if !strings.HasPrefix(ext, ".") {
		ext = "." + ext
	}
	
	// ディレクトリを歩く
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		
		// ファイルであり、指定された拡張子を持つ場合
		if !info.IsDir() && filepath.Ext(path) == ext {
			result = append(result, path)
		}
		
		return nil
	})
	
	return result, err
}
```
