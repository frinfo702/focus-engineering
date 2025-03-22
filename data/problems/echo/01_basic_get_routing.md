---
title: "基本的なGETルーティング"
description: "Echoフレームワークを使った基本的なGETリクエストの処理"
difficulty: "Easy"
category: "routing"
---

# 基本的なGETルーティング

## 問題

Echoフレームワークを使用して、以下の要件を満たす基本的なGETルーティングを実装してください：

1. ルートパス `/` へのGETリクエストに対して「Hello, World!」というテキストを返す
2. `/about` パスへのGETリクエストに対して「About Page」というテキストを返す
3. `/status` パスへのGETリクエストに対して「Server is running」というテキストを返す

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
	"github.com/labstack/echo/v4"
	"net/http"
)

func main() {
	e := echo.New()

	// ルートパスへのGETリクエストハンドラー
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	// /aboutパスへのGETリクエストハンドラー
	e.GET("/about", func(c echo.Context) error {
		return c.String(http.StatusOK, "About Page")
	})

	// /statusパスへのGETリクエストハンドラー
	e.GET("/status", func(c echo.Context) error {
		return c.String(http.StatusOK, "Server is running")
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```
