---
title: "JSONレスポンス処理"
description: "Echoフレームワークでリクエストデータを処理しJSONレスポンスを返す"
difficulty: "Easy"
category: "request-response"
---

# JSONレスポンス処理

## 問題

Echoフレームワークを使用して、ユーザー情報を扱うAPIエンドポイントを実装してください。以下の要件を満たす必要があります：

1. GET `/api/users` - 事前定義されたユーザーリストをJSON形式で返す
2. GET `/api/users/:id` - 指定されたIDのユーザー情報をJSON形式で返す（存在しない場合は404エラー）
3. POST `/api/users` - 新しいユーザー情報をリクエストボディから受け取り、IDを自動生成して追加し、追加されたユーザー情報をJSON形式で返す

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"strconv"
)

// User はユーザー情報を表す構造体です
type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Age  int    `json:"age"`
}

// ユーザーデータを保持するスライス
var users = []User{
	{ID: 1, Name: "田中太郎", Age: 25},
	{ID: 2, Name: "鈴木花子", Age: 30},
}

func main() {
	e := echo.New()
	
	// ここにルートを実装してください
	
	e.Start(":8080")
}
```

## 解答例

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"strconv"
)

// User はユーザー情報を表す構造体です
type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Age  int    `json:"age"`
}

// ユーザーデータを保持するスライス
var users = []User{
	{ID: 1, Name: "田中太郎", Age: 25},
	{ID: 2, Name: "鈴木花子", Age: 30},
}

func main() {
	e := echo.New()
	
	// 1. 全ユーザーリストを返すエンドポイント
	e.GET("/api/users", func(c echo.Context) error {
		return c.JSON(http.StatusOK, users)
	})
	
	// 2. 特定のユーザー情報を返すエンドポイント
	e.GET("/api/users/:id", func(c echo.Context) error {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID format"})
		}
		
		for _, user := range users {
			if user.ID == id {
				return c.JSON(http.StatusOK, user)
			}
		}
		
		return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
	})
	
	// 3. 新しいユーザーを追加するエンドポイント
	e.POST("/api/users", func(c echo.Context) error {
		user := new(User)
		if err := c.Bind(user); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		}
		
		// 新しいIDを生成（単純に最後のID + 1）
		user.ID = users[len(users)-1].ID + 1
		
		// ユーザーをリストに追加
		users = append(users, *user)
		
		return c.JSON(http.StatusCreated, user)
	})
	
	e.Start(":8080")
}
```
