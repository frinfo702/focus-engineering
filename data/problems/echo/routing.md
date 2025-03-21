---
title: "REST APIルーティング"
description: "Echoフレームワークを使ってREST APIのルーティングを実装する"
difficulty: "Medium"
category: "routing"
---

# REST APIルーティング

## 問題

Echoフレームワークを使用して、ユーザー情報を管理するRESTful APIのルーティングを実装してください。

以下のエンドポイントを実装する必要があります：

1. `GET /api/users` - すべてのユーザーを取得
2. `GET /api/users/:id` - 特定のユーザーを取得
3. `POST /api/users` - 新しいユーザーを作成
4. `PUT /api/users/:id` - ユーザー情報を更新
5. `DELETE /api/users/:id` - ユーザーを削除

また、グループルーティングを使用して、すべてのAPIエンドポイントに `/api` プレフィックスをつけてください。

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

// User はユーザー情報を表す構造体
type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// データストア（実際のアプリではデータベースを使用）
var users = []User{
	{ID: 1, Name: "山田太郎", Email: "taro@example.com"},
	{ID: 2, Name: "佐藤花子", Email: "hanako@example.com"},
}

// ハンドラー関数
func getUsers(c echo.Context) error {
	return c.JSON(http.StatusOK, users)
}

func getUserByID(c echo.Context) error {
	// IDをパスパラメータから取得
	
	// ユーザーを検索
	
	// 見つかった場合はJSONで返す
	// 見つからない場合は404エラー
	
	return c.String(http.StatusOK, "実装してください")
}

func createUser(c echo.Context) error {
	// リクエストボディからユーザー情報をバインド
	
	// IDを割り当て（実際のアプリではDBが自動生成）
	
	// ユーザーを追加
	
	// 作成したユーザーを返す
	
	return c.String(http.StatusOK, "実装してください")
}

func updateUser(c echo.Context) error {
	// IDをパスパラメータから取得
	
	// リクエストボディからユーザー情報をバインド
	
	// ユーザーを検索して更新
	
	// 成功時は更新後のユーザー情報を返す
	// 失敗時は404エラー
	
	return c.String(http.StatusOK, "実装してください")
}

func deleteUser(c echo.Context) error {
	// IDをパスパラメータから取得
	
	// ユーザーを検索して削除
	
	// 成功時は204ステータス
	// 失敗時は404エラー
	
	return c.String(http.StatusOK, "実装してください")
}

func main() {
	e := echo.New()
	
	// ルーティングを実装
	
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

// User はユーザー情報を表す構造体
type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// データストア（実際のアプリではデータベースを使用）
var users = []User{
	{ID: 1, Name: "山田太郎", Email: "taro@example.com"},
	{ID: 2, Name: "佐藤花子", Email: "hanako@example.com"},
}

// ハンドラー関数
func getUsers(c echo.Context) error {
	return c.JSON(http.StatusOK, users)
}

func getUserByID(c echo.Context) error {
	// IDをパスパラメータから取得
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "無効なID",
		})
	}
	
	// ユーザーを検索
	for _, user := range users {
		if user.ID == id {
			return c.JSON(http.StatusOK, user)
		}
	}
	
	// 見つからない場合は404エラー
	return c.JSON(http.StatusNotFound, map[string]string{
		"error": "ユーザーが見つかりません",
	})
}

func createUser(c echo.Context) error {
	// リクエストボディからユーザー情報をバインド
	user := new(User)
	if err := c.Bind(user); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "無効なリクエスト",
		})
	}
	
	// IDを割り当て（実際のアプリではDBが自動生成）
	user.ID = len(users) + 1
	
	// ユーザーを追加
	users = append(users, *user)
	
	// 作成したユーザーを返す
	return c.JSON(http.StatusCreated, user)
}

func updateUser(c echo.Context) error {
	// IDをパスパラメータから取得
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "無効なID",
		})
	}
	
	// リクエストボディからユーザー情報をバインド
	updatedUser := new(User)
	if err := c.Bind(updatedUser); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "無効なリクエスト",
		})
	}
	
	// ユーザーを検索して更新
	for i, user := range users {
		if user.ID == id {
			// IDは変更しない
			updatedUser.ID = id
			users[i] = *updatedUser
			return c.JSON(http.StatusOK, updatedUser)
		}
	}
	
	// 見つからない場合は404エラー
	return c.JSON(http.StatusNotFound, map[string]string{
		"error": "ユーザーが見つかりません",
	})
}

func deleteUser(c echo.Context) error {
	// IDをパスパラメータから取得
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "無効なID",
		})
	}
	
	// ユーザーを検索して削除
	for i, user := range users {
		if user.ID == id {
			// 見つかったユーザーを削除
			users = append(users[:i], users[i+1:]...)
			return c.NoContent(http.StatusNoContent)
		}
	}
	
	// 見つからない場合は404エラー
	return c.JSON(http.StatusNotFound, map[string]string{
		"error": "ユーザーが見つかりません",
	})
}

func main() {
	e := echo.New()
	
	// APIグループを作成
	api := e.Group("/api")
	
	// ユーザーリソースのルーティング
	api.GET("/users", getUsers)
	api.GET("/users/:id", getUserByID)
	api.POST("/users", createUser)
	api.PUT("/users/:id", updateUser)
	api.DELETE("/users/:id", deleteUser)
	
	e.Start(":8080")
}
```
