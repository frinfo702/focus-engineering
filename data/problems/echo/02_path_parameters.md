---
title: "パスパラメータ"
description: "Echoフレームワークを使ったパスパラメータの処理"
difficulty: "Easy"
category: "routing"
---

# パスパラメータの取得

## 問題

Echoフレームワークを使用して、以下の要件を満たすパスパラメータ処理を実装してください：

1. `/users/:id` パスへのGETリクエストに対して、パスパラメータ `id` を取得して「User ID: {id}」というテキストを返す
2. `/products/:category/:id` パスへのGETリクエストに対して、パスパラメータ `category` と `id` を取得して「Product Category: {category}, Product ID: {id}」というテキストを返す
3. `/files/*` パスへのGETリクエストに対して、ワイルドカードパスパラメータを取得して「File Path: {path}」というテキストを返す

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

func main() {
	e := echo.New()

	// ここにルーティングを実装してください

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

func main() {
	e := echo.New()

	// ユーザーIDを取得するルート
	e.GET("/users/:id", func(c echo.Context) error {
		// パスパラメータ 'id' を取得
		id := c.Param("id")
		return c.String(http.StatusOK, fmt.Sprintf("User ID: %s", id))
	})

	// 製品カテゴリとIDを取得するルート
	e.GET("/products/:category/:id", func(c echo.Context) error {
		// パスパラメータ 'category' と 'id' を取得
		category := c.Param("category")
		id := c.Param("id")
		return c.String(http.StatusOK, fmt.Sprintf("Product Category: %s, Product ID: %s", category, id))
	})

	// ワイルドカードパスパラメータを取得するルート
	e.GET("/files/*", func(c echo.Context) error {
		// ワイルドカードパスパラメータを取得
		path := c.Param("*")
		return c.String(http.StatusOK, fmt.Sprintf("File Path: %s", path))
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```
