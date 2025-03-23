---
title: "基本的なミドルウェア"
description: "Echoフレームワークでの基本的なミドルウェアの実装"
difficulty: "Medium"
category: "middleware"
relatedResources:
  - title: "Echo公式ドキュメント - ミドルウェア"
    url: "https://echo.labstack.com/docs/middleware"
    description: "Echoフレームワーク公式のミドルウェア解説"
    type: "documentation"
---

# 基本的なミドルウェア

## 問題

Echoフレームワークを使用して、以下の要件を満たす基本的なミドルウェアを実装してください：

1. リクエスト情報をログに出力するミドルウェア：
   - リクエストのメソッド
   - リクエストのURI
   - リクエスト元のIPアドレス
   - リクエストの処理時間（ミリ秒）

2. シンプルなレート制限ミドルウェア：
   - 同一IPアドレスからのリクエストを1分間に最大10回に制限
   - 制限を超えた場合は429 Too Many Requestsステータスコードを返す

3. リクエストIDを生成するミドルウェア：
   - 各リクエストに一意のIDを割り当てる
   - リクエストIDをレスポンスヘッダー「X-Request-ID」に設定する
   - リクエストIDをコンテキストに保存する

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"sync"
	"time"
)

// ロギングミドルウェア
func LoggingMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	// ここにロギングミドルウェアを実装してください
	return nil
}

// レート制限ミドルウェア
func RateLimitMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	// ここにレート制限ミドルウェアを実装してください
	return nil
}

// リクエストIDミドルウェア
func RequestIDMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	// ここにリクエストIDミドルウェアを実装してください
	return nil
}

func main() {
	e := echo.New()

	// ミドルウェアの登録
	e.Use(LoggingMiddleware)
	e.Use(RateLimitMiddleware)
	e.Use(RequestIDMiddleware)

	// テスト用エンドポイント
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	e.GET("/request-id", func(c echo.Context) error {
		// コンテキストからリクエストIDを取得
		requestID := c.Get("request_id").(string)
		return c.String(http.StatusOK, "Request ID: " + requestID)
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```

## 解答例

```go
package main

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"log"
	"net/http"
	"sync"
	"time"
)

// ロギングミドルウェア
func LoggingMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// リクエスト開始時間を記録
		start := time.Now()
		
		// 次のハンドラを実行
		err := next(c)
		
		// リクエスト処理時間を計算
		duration := time.Since(start)
		
		// リクエスト情報をログに出力
		log.Printf(
			"Method: %s, URI: %s, IP: %s, Time: %dms",
			c.Request().Method,
			c.Request().RequestURI,
			c.RealIP(),
			duration.Milliseconds(),
		)
		
		return err
	}
}

// レート制限ミドルウェア
func RateLimitMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	// IPアドレスごとのリクエスト回数と最初のリクエスト時間を記録
	type rateLimit struct {
		count    int
		firstReq time.Time
	}
	
	// スレッドセーフなマップ
	var (
		limits = make(map[string]*rateLimit)
		mu     sync.Mutex
	)
	
	return func(c echo.Context) error {
		ip := c.RealIP()
		
		mu.Lock()
		defer mu.Unlock()
		
		now := time.Now()
		
		// IPアドレスの記録がない、または1分以上経過している場合は新規作成
		if limit, exists := limits[ip]; !exists || now.Sub(limit.firstReq) > time.Minute {
			limits[ip] = &rateLimit{
				count:    1,
				firstReq: now,
			}
		} else {
			// 1分以内のリクエスト回数をカウント
			limit.count++
			
			// 制限を超えた場合はエラーを返す
			if limit.count > 10 {
				return c.String(http.StatusTooManyRequests, "Rate limit exceeded. Try again later.")
			}
		}
		
		return next(c)
	}
}

// リクエストIDミドルウェア
func RequestIDMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// 一意のリクエストIDを生成
		requestID := uuid.New().String()
		
		// リクエストIDをレスポンスヘッダーに設定
		c.Response().Header().Set("X-Request-ID", requestID)
		
		// リクエストIDをコンテキストに保存
		c.Set("request_id", requestID)
		
		return next(c)
	}
}

func main() {
	e := echo.New()

	// ミドルウェアの登録
	e.Use(LoggingMiddleware)
	e.Use(RateLimitMiddleware)
	e.Use(RequestIDMiddleware)

	// テスト用エンドポイント
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	e.GET("/request-id", func(c echo.Context) error {
		// コンテキストからリクエストIDを取得
		requestID := c.Get("request_id").(string)
		return c.String(http.StatusOK, "Request ID: " + requestID)
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```
