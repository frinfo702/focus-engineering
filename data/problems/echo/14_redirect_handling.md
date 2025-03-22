---
title: "リダイレクト処理"
description: "Echoフレームワークでの様々なリダイレクト処理の実装"
difficulty: "Easy"
category: "redirect"
---

# リダイレクト処理

## 問題

Echoフレームワークを使用して、以下の要件を満たす様々なリダイレクト処理を実装してください：

1. 基本的なリダイレクト：
   - `/redirect-basic` エンドポイントにアクセスすると、`/target` にリダイレクトする
   - 302（Found）ステータスコードを使用する

2. 永続的なリダイレクト：
   - `/redirect-permanent` エンドポイントにアクセスすると、`/new-location` に永続的にリダイレクトする
   - 301（Moved Permanently）ステータスコードを使用する

3. カスタムステータスコードによるリダイレクト：
   - `/redirect-custom` エンドポイントにアクセスすると、`/special` にリダイレクトする
   - 307（Temporary Redirect）ステータスコードを使用する

4. 動的なリダイレクト：
   - `/redirect-to` エンドポイントにアクセスすると、クエリパラメータ `url` で指定されたURLにリダイレクトする
   - リダイレクト先のURLが指定されていない場合は、エラーメッセージを表示する

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
)

func main() {
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// ターゲットページ
	e.GET("/target", func(c echo.Context) error {
		return c.String(http.StatusOK, "This is the target page")
	})

	e.GET("/new-location", func(c echo.Context) error {
		return c.String(http.StatusOK, "This is the new permanent location")
	})

	e.GET("/special", func(c echo.Context) error {
		return c.String(http.StatusOK, "This is the special page")
	})

	// 基本的なリダイレクト
	e.GET("/redirect-basic", func(c echo.Context) error {
		// ここに基本的なリダイレクトを実装してください
		return nil
	})

	// 永続的なリダイレクト
	e.GET("/redirect-permanent", func(c echo.Context) error {
		// ここに永続的なリダイレクトを実装してください
		return nil
	})

	// カスタムステータスコードによるリダイレクト
	e.GET("/redirect-custom", func(c echo.Context) error {
		// ここにカスタムステータスコードによるリダイレクトを実装してください
		return nil
	})

	// 動的なリダイレクト
	e.GET("/redirect-to", func(c echo.Context) error {
		// ここに動的なリダイレクトを実装してください
		return nil
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```

## 解答例

```go
package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
	"net/url"
	"strings"
)

func main() {
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// ターゲットページ
	e.GET("/target", func(c echo.Context) error {
		return c.HTML(http.StatusOK, `
			<h1>This is the target page</h1>
			<p>You were redirected here from /redirect-basic</p>
			<p><a href="/">Back to home</a></p>
		`)
	})

	e.GET("/new-location", func(c echo.Context) error {
		return c.HTML(http.StatusOK, `
			<h1>This is the new permanent location</h1>
			<p>You were permanently redirected here from /redirect-permanent</p>
			<p><a href="/">Back to home</a></p>
		`)
	})

	e.GET("/special", func(c echo.Context) error {
		return c.HTML(http.StatusOK, `
			<h1>This is the special page</h1>
			<p>You were redirected here from /redirect-custom with a 307 status code</p>
			<p><a href="/">Back to home</a></p>
		`)
	})

	// 基本的なリダイレクト
	e.GET("/redirect-basic", func(c echo.Context) error {
		// 302 Found ステータスコードでリダイレクト
		return c.Redirect(http.StatusFound, "/target")
	})

	// 永続的なリダイレクト
	e.GET("/redirect-permanent", func(c echo.Context) error {
		// 301 Moved Permanently ステータスコードでリダイレクト
		return c.Redirect(http.StatusMovedPermanently, "/new-location")
	})

	// カスタムステータスコードによるリダイレクト
	e.GET("/redirect-custom", func(c echo.Context) error {
		// 307 Temporary Redirect ステータスコードでリダイレクト
		return c.Redirect(http.StatusTemporaryRedirect, "/special")
	})

	// 動的なリダイレクト
	e.GET("/redirect-to", func(c echo.Context) error {
		// クエリパラメータからURLを取得
		redirectURL := c.QueryParam("url")
		
		if redirectURL == "" {
			return c.HTML(http.StatusBadRequest, `
				<h1>Error: Missing URL</h1>
				<p>Please provide a URL to redirect to using the 'url' query parameter.</p>
				<p>Example: <a href="/redirect-to?url=/target">/redirect-to?url=/target</a></p>
				<p><a href="/">Back to home</a></p>
			`)
		}
		
		// URLの検証（セキュリティ対策）
		// 相対パスのみを許可し、外部サイトへのリダイレクトを防止
		if !strings.HasPrefix(redirectURL, "/") || strings.Contains(redirectURL, "://") {
			return c.HTML(http.StatusBadRequest, `
				<h1>Error: Invalid URL</h1>
				<p>Only relative paths starting with '/' are allowed.</p>
				<p><a href="/">Back to home</a></p>
			`)
		}
		
		// URLエンコードされた文字をデコード
		decodedURL, err := url.QueryUnescape(redirectURL)
		if err != nil {
			return c.HTML(http.StatusBadRequest, `
				<h1>Error: Invalid URL Encoding</h1>
				<p>The provided URL contains invalid encoding.</p>
				<p><a href="/">Back to home</a></p>
			`)
		}
		
		// リダイレクト
		return c.Redirect(http.StatusFound, decodedURL)
	})

	// ホームページ
	e.GET("/", func(c echo.Context) error {
		return c.HTML(http.StatusOK, `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Echo Redirect Demo</title>
				<style>
					body {
						font-family: Arial, sans-serif;
						margin: 20px;
						line-height: 1.6;
					}
					.container {
						max-width: 800px;
						margin: 0 auto;
					}
					h1 {
						color: #333;
					}
					ul {
						list-style-type: none;
						padding: 0;
					}
					li {
						margin: 10px 0;
					}
					a {
						color: #0066cc;
						text-decoration: none;
					}
					a:hover {
						text-decoration: underline;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<h1>Echo Redirect Demo</h1>
					<p>Click on the links below to test different types of redirects:</p>
					
					<ul>
						<li><a href="/redirect-basic">Basic Redirect (302 Found)</a></li>
						<li><a href="/redirect-permanent">Permanent Redirect (301 Moved Permanently)</a></li>
						<li><a href="/redirect-custom">Custom Status Redirect (307 Temporary Redirect)</a></li>
						<li><a href="/redirect-to?url=/target">Dynamic Redirect to /target</a></li>
						<li><a href="/redirect-to?url=/new-location">Dynamic Redirect to /new-location</a></li>
						<li><a href="/redirect-to">Dynamic Redirect (Error: Missing URL)</a></li>
						<li><a href="/redirect-to?url=https://example.com">Dynamic Redirect (Error: External URL)</a></li>
					</ul>
					
					<h2>Direct Access:</h2>
					<ul>
						<li><a href="/target">Target Page</a></li>
						<li><a href="/new-location">New Location Page</a></li>
						<li><a href="/special">Special Page</a></li>
					</ul>
				</div>
			</body>
			</html>
		`)
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```
