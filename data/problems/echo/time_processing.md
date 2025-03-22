---
title: "時間と日付の処理"
description: "timeパッケージを使用した時間と日付の操作"
difficulty: "Easy"
category: "標準ライブラリ"
subcategory: "time"
---

# 時間と日付の処理

## 問題

時間と日付を処理する以下の関数を実装してください：

1. `FormatDateTime`: 指定された時間を "2006-01-02 15:04:05" 形式の文字列に変換する関数
2. `ParseDateTime`: "2006-01-02 15:04:05" 形式の文字列から時間オブジェクトを作成する関数
3. `AddBusinessDays`: 指定された日付に営業日（月〜金）を追加する関数（土日はスキップ）

## ベースコード

```go
package timeprocessing

import (
	// 必要なパッケージをインポートしてください
)

// FormatDateTime は時間オブジェクトを指定された形式の文字列に変換します
func FormatDateTime(t time.Time) string {
	// ここに実装を書いてください
}

// ParseDateTime は文字列から時間オブジェクトを作成します
func ParseDateTime(dateStr string) (time.Time, error) {
	// ここに実装を書いてください
}

// AddBusinessDays は指定された日付に営業日を追加します（土日はスキップ）
func AddBusinessDays(date time.Time, days int) time.Time {
	// ここに実装を書いてください
}
```

## 解答例

```go
package timeprocessing

import (
	"time"
)

// FormatDateTime は時間オブジェクトを指定された形式の文字列に変換します
func FormatDateTime(t time.Time) string {
	return t.Format("2006-01-02 15:04:05")
}

// ParseDateTime は文字列から時間オブジェクトを作成します
func ParseDateTime(dateStr string) (time.Time, error) {
	return time.Parse("2006-01-02 15:04:05", dateStr)
}

// AddBusinessDays は指定された日付に営業日を追加します（土日はスキップ）
func AddBusinessDays(date time.Time, days int) time.Time {
	result := date
	addedDays := 0
	
	for addedDays < days {
		// 1日進める
		result = result.AddDate(0, 0, 1)
		
		// 土曜日（6）または日曜日（0）でなければカウント
		if result.Weekday() != time.Saturday && result.Weekday() != time.Sunday {
			addedDays++
		}
	}
	
	return result
}
```
