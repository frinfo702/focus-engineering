---
title: "ファイル読み込みと行処理"
description: "bufioパッケージを使用したファイルの行単位での読み込みと処理"
difficulty: "Easy"
category: "標準ライブラリ"
subcategory: "bufio"
relatedResources:
  - title: "Go公式ドキュメント - bufioパッケージ"
    url: "https://golang.org/pkg/bufio/"
    description: "Go言語標準のbufioパッケージのドキュメント"
    type: "documentation"
---

# ファイル読み込みと行処理

## 問題

テキストファイルを行単位で読み込み、各行の文字数をカウントする関数 `CountCharsPerLine` を実装してください。

要件:
1. 指定されたファイルパスのテキストファイルを開く
2. ファイルを行単位で読み込む
3. 各行の文字数（改行文字を除く）をカウントし、行番号と文字数のマップを返す
4. ファイルが存在しない場合はエラーを返す

## ベースコード

```go
package fileprocessing

import (
	// 必要なパッケージをインポートしてください
)

// CountCharsPerLine は指定されたファイルの各行の文字数をカウントします
// 戻り値は行番号（1始まり）と文字数のマップです
func CountCharsPerLine(filePath string) (map[int]int, error) {
	// ここに実装を書いてください
}
```

## 解答例

```go
package fileprocessing

import (
	"bufio"
	"os"
)

// CountCharsPerLine は指定されたファイルの各行の文字数をカウントします
// 戻り値は行番号（1始まり）と文字数のマップです
func CountCharsPerLine(filePath string) (map[int]int, error) {
	// ファイルを開く
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// 行単位で読み込むためのスキャナーを作成
	scanner := bufio.NewScanner(file)
	
	// 結果を格納するマップを初期化
	charCounts := make(map[int]int)
	
	// 行番号を追跡
	lineNum := 0
	
	// ファイルを行単位で読み込む
	for scanner.Scan() {
		lineNum++
		line := scanner.Text() // 改行文字を除いた行を取得
		charCounts[lineNum] = len(line)
	}
	
	// スキャン中にエラーが発生したかチェック
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	
	return charCounts, nil
}
```
