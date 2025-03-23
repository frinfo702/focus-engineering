---
title: "HTTPメソッド"
description: "Echoフレームワークでの各種HTTPメソッドの実装"
difficulty: "Easy"
category: "routing"
relatedResources:
  - title: "Echo公式ドキュメント - ルーティング"
    url: "https://echo.labstack.com/docs/routing"
    description: "Echoフレームワーク公式のルーティングとHTTPメソッドの解説"
    type: "documentation"
---

# HTTPメソッド

## 問題

Echoフレームワークを使用して、以下の要件を満たす各種HTTPメソッドを実装してください：

1. `/api/resource` に対して以下のHTTPメソッドを実装：
   - GET - 「Resource list」というテキストを返す
   - POST - 「Resource created」というテキストを返す
   - PUT - 「Resource updated completely」というテキストを返す
   - PATCH - 「Resource updated partially」というテキストを返す
   - DELETE - 「Resource deleted」というテキストを返す

2. `/api/options` に対してOPTIONSメソッドを実装し、「Available methods: GET, POST, PUT, PATCH, DELETE」というテキストを返す

3. 任意のパスに対してHEADメソッドを実装し、GETメソッドと同じレスポンスヘッダーを返すが、ボディは空にする

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

func main() {
	e := echo.New()

	// ここに各種HTTPメソッドを実装してください

	e.Logger.Fatal(e.Start(":8080"))
}
```

## 解答例

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

func main() {
	e := echo.New()

	// GETメソッド - リソース一覧の取得
	e.GET("/api/resource", func(c echo.Context) error {
		return c.String(http.StatusOK, "Resource list")
	})

	// POSTメソッド - リソースの作成
	e.POST("/api/resource", func(c echo.Context) error {
		return c.String(http.StatusCreated, "Resource created")
	})

	// PUTメソッド - リソースの完全更新
	e.PUT("/api/resource", func(c echo.Context) error {
		return c.String(http.StatusOK, "Resource updated completely")
	})

	// PATCHメソッド - リソースの部分更新
	e.PATCH("/api/resource", func(c echo.Context) error {
		return c.String(http.StatusOK, "Resource updated partially")
	})

	// DELETEメソッド - リソースの削除
	e.DELETE("/api/resource", func(c echo.Context) error {
		return c.String(http.StatusOK, "Resource deleted")
	})

	// OPTIONSメソッド - 利用可能なメソッドの表示
	e.OPTIONS("/api/options", func(c echo.Context) error {
		return c.String(http.StatusOK, "Available methods: GET, POST, PUT, PATCH, DELETE")
	})

	// HEADメソッド - GETと同じヘッダーを返すが、ボディは空
	e.HEAD("/api/resource", func(c echo.Context) error {
		// HEADリクエストではボディは送信されないため、
		// ステータスコードとヘッダーのみを設定
		c.Response().Header().Set("X-Resource-Count", "42")
		return c.NoContent(http.StatusOK)
	})

	// 任意のパスに対するHEADメソッドのデモ
	e.GET("/api/data", func(c echo.Context) error {
		c.Response().Header().Set("X-Data-Count", "100")
		return c.String(http.StatusOK, "This is the data")
	})

	e.HEAD("/api/data", func(c echo.Context) error {
		c.Response().Header().Set("X-Data-Count", "100")
		return c.NoContent(http.StatusOK)
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```
