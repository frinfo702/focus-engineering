---
title: "基本的なルーティング"
description: "Echoフレームワークで基本的なルーティングを実装する"
difficulty: "Easy"
category: "routing"
---

# 基本的なルーティング

## 問題

Echoフレームワークを使用して、以下の要件を満たすAPIエンドポイントを実装してください：

1. GET `/api/hello` - "Hello, World!"というテキストを返す
2. GET `/api/users/:id` - パスパラメータとして渡されたIDを含む "User ID: {id}" というテキストを返す
3. GET `/api/query` - クエリパラメータ `name` の値を含む "Hello, {name}!" というテキストを返す（nameが指定されていない場合は "Hello, Guest!" を返す）

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

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
	"fmt"
	"github.com/labstack/echo/v4"
	"net/http"
)

func main() {
	e := echo.New()
	
	// 1. 基本的なGETエンドポイント
	e.GET("/api/hello", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})
	
	// 2. パスパラメータを使用したエンドポイント
	e.GET("/api/users/:id", func(c echo.Context) error {
		id := c.Param("id")
		return c.String(http.StatusOK, fmt.Sprintf("User ID: %s", id))
	})
	
	// 3. クエリパラメータを使用したエンドポイント
	e.GET("/api/query", func(c echo.Context) error {
		name := c.QueryParam("name")
		if name == "" {
			name = "Guest"
		}
		return c.String(http.StatusOK, fmt.Sprintf("Hello, %s!", name))
	})
	
	e.Start(":8080")
}
```
