---
title: "グループルーティング"
description: "Echoフレームワークを使ったグループルーティングの実装"
difficulty: "Easy"
category: "routing"
relatedResources:
  - title: "Echo公式ドキュメント - グループルーティング"
    url: "https://echo.labstack.com/docs/routing#group"
    description: "Echoフレームワーク公式のグループルーティングの解説"
    type: "documentation"

---

# グループルーティング

## 問題

Echoフレームワークを使用して、以下の要件を満たすグループルーティングを実装してください：

1. `/api/v1` プレフィックスを持つAPIルートグループを作成
2. APIグループ内に以下のエンドポイントを実装：
   - GET `/api/v1/users` - 「List of users」というテキストを返す
   - GET `/api/v1/users/:id` - 「User details for ID: {id}」というテキストを返す
   - POST `/api/v1/users` - 「User created」というテキストを返す
3. `/admin` プレフィックスを持つ管理者ルートグループを作成
4. 管理者グループ内に以下のエンドポイントを実装：
   - GET `/admin/dashboard` - 「Admin Dashboard」というテキストを返す
   - GET `/admin/users` - 「Admin: User Management」というテキストを返す

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

func main() {
	e := echo.New()

	// ここにグループルーティングを実装してください

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

	// APIルートグループの作成
	apiV1 := e.Group("/api/v1")
	
	// APIグループ内のルート定義
	apiV1.GET("/users", func(c echo.Context) error {
		return c.String(http.StatusOK, "List of users")
	})
	
	apiV1.GET("/users/:id", func(c echo.Context) error {
		id := c.Param("id")
		return c.String(http.StatusOK, fmt.Sprintf("User details for ID: %s", id))
	})
	
	apiV1.POST("/users", func(c echo.Context) error {
		return c.String(http.StatusCreated, "User created")
	})
	
	// 管理者ルートグループの作成
	admin := e.Group("/admin")
	
	// 管理者グループ内のルート定義
	admin.GET("/dashboard", func(c echo.Context) error {
		return c.String(http.StatusOK, "Admin Dashboard")
	})
	
	admin.GET("/users", func(c echo.Context) error {
		return c.String(http.StatusOK, "Admin: User Management")
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```
