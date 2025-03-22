---
title: "型変換の基本"
description: "strconvパッケージを使用した文字列と基本型の変換"
difficulty: "Easy"
category: "標準ライブラリ"
subcategory: "strconv"
---

# 型変換の基本

## 問題

strconvパッケージを使用して、以下の型変換関数を実装してください：

1. `StringToInt`: 文字列を整数に変換する関数
2. `IntToString`: 整数を文字列に変換する関数
3. `StringToFloat`: 文字列を浮動小数点数に変換する関数
4. `StringToBool`: 文字列を真偽値に変換する関数（"true", "false", "1", "0"をサポート）

## ベースコード

```go
package conversion

import (
	// 必要なパッケージをインポートしてください
)

// StringToInt は文字列を整数に変換します
func StringToInt(s string) (int, error) {
	// ここに実装を書いてください
}

// IntToString は整数を文字列に変換します
func IntToString(i int) string {
	// ここに実装を書いてください
}

// StringToFloat は文字列を浮動小数点数に変換します
func StringToFloat(s string) (float64, error) {
	// ここに実装を書いてください
}

// StringToBool は文字列を真偽値に変換します
func StringToBool(s string) (bool, error) {
	// ここに実装を書いてください
}
```

## 解答例

```go
package conversion

import (
	"errors"
	"strconv"
	"strings"
)

// StringToInt は文字列を整数に変換します
func StringToInt(s string) (int, error) {
	return strconv.Atoi(s)
}

// IntToString は整数を文字列に変換します
func IntToString(i int) string {
	return strconv.Itoa(i)
}

// StringToFloat は文字列を浮動小数点数に変換します
func StringToFloat(s string) (float64, error) {
	return strconv.ParseFloat(s, 64)
}

// StringToBool は文字列を真偽値に変換します
func StringToBool(s string) (bool, error) {
	// 標準のケースを処理
	s = strings.ToLower(s)
	if s == "true" || s == "false" {
		return strconv.ParseBool(s)
	}
	
	// 数値のケースを処理
	if s == "1" {
		return true, nil
	} else if s == "0" {
		return false, nil
	}
	
	return false, errors.New("invalid boolean string")
}
```
