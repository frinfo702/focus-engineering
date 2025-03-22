---
title: "名前付きルート"
description: "Echoフレームワークでの名前付きルートの定義と使用"
difficulty: "Easy"
category: "routing"
---

# 名前付きルート

## 問題

Echoフレームワークを使用して、以下の要件を満たす名前付きルートを実装してください：

1. 以下のルートを名前付きで定義する：
   - GET `/users/:id` - 名前: `user-detail`
   - GET `/products/:category/:id` - 名前: `product-detail`
   - GET `/articles/:slug` - 名前: `article-detail`

2. 以下のエンドポイントを実装：
   - GET `/routes` - 定義した各名前付きルートへのURLを生成し、以下の形式で返す：
     ```
     User Detail URL: /users/123
     Product Detail URL: /products/electronics/456
     Article Detail URL: /articles/echo-framework-tutorial
     ```

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

func main() {
	e := echo.New()

	// ここに名前付きルートを定義してください

	// ルート情報を表示するエンドポイント
	e.GET("/routes", func(c echo.Context) error {
		// ここに名前付きルートからURLを生成するコードを実装してください
		return c.String(http.StatusOK, "Routes information")
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
	"strings"
)

func main() {
	e := echo.New()

	// 名前付きルートの定義
	e.GET("/users/:id", func(c echo.Context) error {
		id := c.Param("id")
		return c.String(http.StatusOK, fmt.Sprintf("User ID: %s", id))
	}).Name = "user-detail"

	e.GET("/products/:category/:id", func(c echo.Context) error {
		category := c.Param("category")
		id := c.Param("id")
		return c.String(http.StatusOK, fmt.Sprintf("Product Category: %s, ID: %s", category, id))
	}).Name = "product-detail"

	e.GET("/articles/:slug", func(c echo.Context) error {
		slug := c.Param("slug")
		return c.String(http.StatusOK, fmt.Sprintf("Article: %s", slug))
	}).Name = "article-detail"

	// ルート情報を表示するエンドポイント
	e.GET("/routes", func(c echo.Context) error {
		// 名前付きルートからURLを生成
		userURL := e.Reverse("user-detail", "123")
		productURL := e.Reverse("product-detail", "electronics", "456")
		articleURL := e.Reverse("article-detail", "echo-framework-tutorial")

		// 結果を構築
		var sb strings.Builder
		sb.WriteString(fmt.Sprintf("User Detail URL: %s\n", userURL))
		sb.WriteString(fmt.Sprintf("Product Detail URL: %s\n", productURL))
		sb.WriteString(fmt.Sprintf("Article Detail URL: %s", articleURL))

		return c.String(http.StatusOK, sb.String())
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```
