---
title: "エラーハンドリング"
description: "Echoフレームワークでカスタムエラーハンドラを実装する"
difficulty: "Medium"
category: "error-handling"
---

# エラーハンドリング

## 問題

Echoフレームワークで、以下の要件を満たすカスタムエラーハンドラを実装してください：

1. HTTPエラー（4xx, 5xx）が発生した場合、JSONフォーマットでエラー情報を返す
2. エラーレスポンスには以下の情報を含める：
   - `status`: HTTPステータスコード
   - `message`: エラーメッセージ
   - `timestamp`: エラーが発生した時刻（ISO 8601形式）

また、以下のエンドポイントを実装して、エラーハンドリングをテストしてください：
1. GET `/api/not-found` - 404 Not Foundエラーを返す
2. GET `/api/bad-request` - 400 Bad Requestエラーを返す
3. GET `/api/server-error` - 500 Internal Server Errorを返す

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

// カスタムエラーハンドラを実装してください

func main() {
	e := echo.New()
	
	// カスタムエラーハンドラを設定
	// ここにコードを追加
	
	// テスト用エンドポイント
	// ここにコードを追加
	
	e.Start(":8080")
}
```

## 解答例

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"time"
)

// ErrorResponse はエラーレスポンスの構造を定義します
type ErrorResponse struct {
	Status    int       `json:"status"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

// カスタムHTTPエラーハンドラ
func customErrorHandler(err error, c echo.Context) {
	code := http.StatusInternalServerError
	message := "Internal Server Error"
	
	// Echoのエラーハンドリング
	if he, ok := err.(*echo.HTTPError); ok {
		code = he.Code
		if m, ok := he.Message.(string); ok {
			message = m
		} else {
			message = "An error occurred"
		}
	}
	
	// エラーレスポンスを作成
	errorResponse := ErrorResponse{
		Status:    code,
		Message:   message,
		Timestamp: time.Now(),
	}
	
	// JSONレスポンスを返す
	c.JSON(code, errorResponse)
}

func main() {
	e := echo.New()
	
	// カスタムエラーハンドラを設定
	e.HTTPErrorHandler = customErrorHandler
	
	// テスト用エンドポイント
	e.GET("/api/not-found", func(c echo.Context) error {
		return echo.NewHTTPError(http.StatusNotFound, "Resource not found")
	})
	
	e.GET("/api/bad-request", func(c echo.Context) error {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request parameters")
	})
	
	e.GET("/api/server-error", func(c echo.Context) error {
		return echo.NewHTTPError(http.StatusInternalServerError, "Something went wrong on the server")
	})
	
	e.Start(":8080")
}
```
