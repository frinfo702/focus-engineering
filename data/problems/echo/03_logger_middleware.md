---
title: "ログ記録ミドルウェア"
description: "Echoでリクエスト情報をログに記録するミドルウェアを実装する"
difficulty: "Medium"
category: "middleware"
---

# ログ記録ミドルウェア

## 問題

Echoフレームワークで、以下の情報をログに記録するミドルウェアを実装してください：

1. リクエストのメソッド
2. リクエストのURI
3. レスポンスのステータスコード
4. リクエスト処理にかかった時間（ミリ秒）

ログは以下のフォーマットで出力してください：
```
[INFO] 2023/01/01 12:00:00 | GET /api/users | 200 | 10ms
```

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

// LoggerMiddleware はロギング機能を提供するミドルウェアです
// ここに実装を書いてください

func main() {
	e := echo.New()
	
	// ミドルウェアを登録
	e.Use(LoggerMiddleware)
	
	// ルート
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})
	
	e.Start(":8080")
}
```

## 解答例

```go
package main

import (
	"fmt"
	"github.com/labstack/echo/v4"
	"log"
	"net/http"
	"time"
)

// LoggerMiddleware はロギング機能を提供するミドルウェアです
func LoggerMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		start := time.Now()
		
		// 次のハンドラを実行
		err := next(c)
		
		// レスポンス後の処理
		stop := time.Now()
		duration := stop.Sub(start)
		
		// リクエスト情報を取得
		req := c.Request()
		res := c.Response()
		
		// ログ出力
		log.Printf("[INFO] %s | %s %s | %d | %dms",
			time.Now().Format("2006/01/02 15:04:05"),
			req.Method, req.RequestURI,
			res.Status, duration.Milliseconds())
		
		return err
	}
}

func main() {
	e := echo.New()
	
	// ミドルウェアを登録
	e.Use(LoggerMiddleware)
	
	// ルート
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})
	
	e.Start(":8080")
}
```
