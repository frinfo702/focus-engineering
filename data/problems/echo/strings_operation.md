---
title: "文字列操作の基本"
description: "stringsパッケージを使用した基本的な文字列操作"
difficulty: "Easy"
category: "標準ライブラリ"
subcategory: "strings"
---

# 文字列操作の基本

## 問題

文字列操作に関する以下の関数を実装してください：

1. `CountWords`: 文字列内の単語数をカウントする関数（単語は空白文字で区切られているとします）
2. `ReverseWords`: 文字列内の単語の順序を逆にする関数（単語自体は逆にしない）
3. `CensorEmail`: メールアドレスの@より前の部分を"*"でマスクする関数

## ベースコード

```go
package stringops

import (
	// 必要なパッケージをインポートしてください
)

// CountWords は文字列内の単語数をカウントします
func CountWords(s string) int {
	// ここに実装を書いてください
}

// ReverseWords は文字列内の単語の順序を逆にします
func ReverseWords(s string) string {
	// ここに実装を書いてください
}

// CensorEmail はメールアドレスの@より前の部分を"*"でマスクします
func CensorEmail(email string) string {
	// ここに実装を書いてください
}
```

## 解答例

```go
package stringops

import (
	"strings"
)

// CountWords は文字列内の単語数をカウントします
func CountWords(s string) int {
	// 空文字列の場合は0を返す
	if len(strings.TrimSpace(s)) == 0 {
		return 0
	}
	
	// 空白文字で分割して単語数をカウント
	words := strings.Fields(s)
	return len(words)
}

// ReverseWords は文字列内の単語の順序を逆にします
func ReverseWords(s string) string {
	// 空白文字で分割
	words := strings.Fields(s)
	
	// 単語の順序を逆にする
	for i, j := 0, len(words)-1; i < j; i, j = i+1, j-1 {
		words[i], words[j] = words[j], words[i]
	}
	
	// 単語を空白で結合して返す
	return strings.Join(words, " ")
}

// CensorEmail はメールアドレスの@より前の部分を"*"でマスクします
func CensorEmail(email string) string {
	// @の位置を見つける
	atIndex := strings.Index(email, "@")
	
	// @が見つからない場合はそのまま返す
	if atIndex == -1 {
		return email
	}
	
	// ユーザー名部分を"*"に置き換え
	maskedPart := strings.Repeat("*", atIndex)
	domainPart := email[atIndex:]
	
	return maskedPart + domainPart
}
```
