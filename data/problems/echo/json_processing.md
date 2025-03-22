---
title: "JSONデータの処理"
description: "encoding/jsonパッケージを使用したJSONデータのエンコードとデコード"
difficulty: "Easy"
category: "標準ライブラリ"
subcategory: "encoding/json"
---

# JSONデータの処理

## 問題

ユーザー情報を含むJSONデータを処理する2つの関数を実装してください：

1. `DecodeUserJSON`: JSON文字列からユーザー情報を取得する関数
2. `EncodeUserJSON`: ユーザー情報をJSON文字列に変換する関数

要件:
- ユーザー情報には、ID、名前、メールアドレス、登録日が含まれます
- 登録日はISO 8601形式（例: "2023-01-15T14:30:45Z"）で処理する必要があります
- JSONフィールド名は小文字で始まるキャメルケース（例: "userId"）とします

## ベースコード

```go
package jsonprocessing

import (
	// 必要なパッケージをインポートしてください
)

// User はユーザー情報を表す構造体です
type User struct {
	// 適切なフィールドとJSONタグを定義してください
}

// DecodeUserJSON はJSON文字列からユーザー情報を取得します
func DecodeUserJSON(jsonStr string) (User, error) {
	// ここに実装を書いてください
}

// EncodeUserJSON はユーザー情報をJSON文字列に変換します
func EncodeUserJSON(user User) (string, error) {
	// ここに実装を書いてください
}
```

## 解答例

```go
package jsonprocessing

import (
	"encoding/json"
	"time"
)

// User はユーザー情報を表す構造体です
type User struct {
	ID        int       `json:"userId"`
	Name      string    `json:"userName"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"createdAt"`
}

// DecodeUserJSON はJSON文字列からユーザー情報を取得します
func DecodeUserJSON(jsonStr string) (User, error) {
	var user User
	err := json.Unmarshal([]byte(jsonStr), &user)
	if err != nil {
		return User{}, err
	}
	return user, nil
}

// EncodeUserJSON はユーザー情報をJSON文字列に変換します
func EncodeUserJSON(user User) (string, error) {
	bytes, err := json.Marshal(user)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}
```
