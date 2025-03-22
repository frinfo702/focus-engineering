---
title: "クエリパラメータ"
description: "Echoフレームワークを使ったクエリパラメータの処理"
difficulty: "Easy"
category: "routing"
---

# クエリパラメータの取得

## 問題

Echoフレームワークを使用して、以下の要件を満たすクエリパラメータ処理を実装してください：

1. `/search` パスへのGETリクエストで、クエリパラメータ `q` を取得して「Search Query: {q}」というテキストを返す
2. `/products` パスへのGETリクエストで、クエリパラメータ `category` と `sort` を取得して「Category: {category}, Sort: {sort}」というテキストを返す（デフォルト値: category="all", sort="name"）
3. `/users` パスへのGETリクエストで、クエリパラメータ `page` と `limit` を整数として取得して「Page: {page}, Limit: {limit}」というテキストを返す（デフォルト値: page=1, limit=10）

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
	"strconv"
)

func main() {
	e := echo.New()

	// 検索クエリを取得するルート
	e.GET("/search", func(c echo.Context) error {
		// クエリパラメータ 'q' を取得
		q := c.QueryParam("q")
		return c.String(http.StatusOK, fmt.Sprintf("Search Query: %s", q))
	})

	// 製品リストのフィルタリングとソートを行うルート
	e.GET("/products", func(c echo.Context) error {
		// クエリパラメータ 'category' と 'sort' を取得（デフォルト値付き）
		category := c.QueryParam("category")
		if category == "" {
			category = "all"
		}
		
		sort := c.QueryParam("sort")
		if sort == "" {
			sort = "name"
		}
		
		return c.String(http.StatusOK, fmt.Sprintf("Category: %s, Sort: %s", category, sort))
	})

	// ユーザーリストのページネーションを行うルート
	e.GET("/users", func(c echo.Context) error {
		// クエリパラメータ 'page' と 'limit' を整数として取得（デフォルト値付き）
		pageStr := c.QueryParam("page")
		page := 1 // デフォルト値
		if pageStr != "" {
			if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
				page = p
			}
		}
		
		limitStr := c.QueryParam("limit")
		limit := 10 // デフォルト値
		if limitStr != "" {
			if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
				limit = l
			}
		}
		
		return c.String(http.StatusOK, fmt.Sprintf("Page: %d, Limit: %d", page, limit))
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```
