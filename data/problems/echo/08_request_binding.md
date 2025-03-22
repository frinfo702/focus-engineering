---
title: "リクエストバインディング"
description: "Echoフレームワークでのリクエストデータのバインディング"
difficulty: "Medium"
category: "binding"
---

# リクエストバインディング

## 問題

Echoフレームワークを使用して、以下の要件を満たすリクエストバインディングを実装してください：

1. JSONリクエストのバインディング：
   - POSTリクエストで送信されたJSONデータを構造体にバインドする
   - `/api/users` エンドポイントで、ユーザー情報（名前、メール、年齢）を受け取る

2. フォームデータのバインディング：
   - POSTリクエストで送信されたフォームデータを構造体にバインドする
   - `/api/contact` エンドポイントで、問い合わせ情報（名前、メール、メッセージ）を受け取る

3. クエリパラメータのバインディング：
   - GETリクエストのクエリパラメータを構造体にバインドする
   - `/api/search` エンドポイントで、検索条件（キーワード、カテゴリ、ページ、制限）を受け取る

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

// ユーザー情報の構造体
type User struct {
	// ここにユーザー情報のフィールドを定義してください
}

// 問い合わせ情報の構造体
type Contact struct {
	// ここに問い合わせ情報のフィールドを定義してください
}

// 検索条件の構造体
type SearchParams struct {
	// ここに検索条件のフィールドを定義してください
}

func main() {
	e := echo.New()

	// JSONリクエストのバインディング
	e.POST("/api/users", func(c echo.Context) error {
		// ここにJSONリクエストのバインディングを実装してください
		return c.String(http.StatusOK, "User created")
	})

	// フォームデータのバインディング
	e.POST("/api/contact", func(c echo.Context) error {
		// ここにフォームデータのバインディングを実装してください
		return c.String(http.StatusOK, "Contact message received")
	})

	// クエリパラメータのバインディング
	e.GET("/api/search", func(c echo.Context) error {
		// ここにクエリパラメータのバインディングを実装してください
		return c.String(http.StatusOK, "Search results")
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```

## 解答例

```go
package main

import (
	"fmt"
	"github.com/labstack/echo/v4"
	"net/http"
)

// ユーザー情報の構造体
type User struct {
	Name  string `json:"name" form:"name"`
	Email string `json:"email" form:"email"`
	Age   int    `json:"age" form:"age"`
}

// 問い合わせ情報の構造体
type Contact struct {
	Name    string `json:"name" form:"name"`
	Email   string `json:"email" form:"email"`
	Message string `json:"message" form:"message"`
}

// 検索条件の構造体
type SearchParams struct {
	Keyword  string `query:"keyword"`
	Category string `query:"category"`
	Page     int    `query:"page"`
	Limit    int    `query:"limit"`
}

func main() {
	e := echo.New()

	// JSONリクエストのバインディング
	e.POST("/api/users", func(c echo.Context) error {
		// ユーザー構造体のインスタンスを作成
		user := new(User)
		
		// リクエストボディをユーザー構造体にバインド
		if err := c.Bind(user); err != nil {
			return c.String(http.StatusBadRequest, "Invalid request data")
		}
		
		// バインドされたデータの検証
		if user.Name == "" || user.Email == "" {
			return c.String(http.StatusBadRequest, "Name and email are required")
		}
		
		// 成功レスポンス
		return c.JSON(http.StatusCreated, map[string]interface{}{
			"message": "User created successfully",
			"user":    user,
		})
	})

	// フォームデータのバインディング
	e.POST("/api/contact", func(c echo.Context) error {
		// 問い合わせ構造体のインスタンスを作成
		contact := new(Contact)
		
		// フォームデータを問い合わせ構造体にバインド
		if err := c.Bind(contact); err != nil {
			return c.String(http.StatusBadRequest, "Invalid form data")
		}
		
		// バインドされたデータの検証
		if contact.Name == "" || contact.Email == "" || contact.Message == "" {
			return c.String(http.StatusBadRequest, "All fields are required")
		}
		
		// 成功レスポンス
		return c.JSON(http.StatusOK, map[string]interface{}{
			"message": "Contact message received",
			"contact": contact,
		})
	})

	// クエリパラメータのバインディング
	e.GET("/api/search", func(c echo.Context) error {
		// 検索条件構造体のインスタンスを作成
		params := new(SearchParams)
		
		// クエリパラメータを検索条件構造体にバインド
		if err := c.Bind(params); err != nil {
			return c.String(http.StatusBadRequest, "Invalid query parameters")
		}
		
		// デフォルト値の設定
		if params.Page <= 0 {
			params.Page = 1
		}
		
		if params.Limit <= 0 {
			params.Limit = 10
		}
		
		// 成功レスポンス
		return c.JSON(http.StatusOK, map[string]interface{}{
			"message": fmt.Sprintf("Searching for '%s' in category '%s', page %d, limit %d",
				params.Keyword, params.Category, params.Page, params.Limit),
			"params": params,
		})
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```
