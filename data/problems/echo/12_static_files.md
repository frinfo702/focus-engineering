---
title: "静的ファイルの提供"
description: "Echoフレームワークでの静的ファイルの提供方法"
difficulty: "Easy"
category: "static-files"
---

# 静的ファイル配信

## 問題

Echoフレームワークを使用して、以下の要件を満たす静的ファイル配信を実装してください：

1. 基本的な静的ファイル配信：
   - `/static/*` パスで `public` ディレクトリ内のファイルを配信する
   - 例：`/static/css/style.css` は `public/css/style.css` を配信

2. 複数のディレクトリからの配信：
   - `/assets/*` パスで `assets` ディレクトリ内のファイルを配信する
   - `/uploads/*` パスで `uploads` ディレクトリ内のファイルを配信する

3. インデックスページの配信：
   - ルートパス `/` にアクセスした際に `public/index.html` を配信する

4. カスタム404ページの配信：
   - 存在しないファイルにアクセスした際に `public/404.html` を配信する

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
	"os"
)

func main() {
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// ここに静的ファイル配信の設定を実装してください

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
	"os"
)

// カスタム404ハンドラー
func custom404Handler(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		err := next(c)
		
		if err != nil {
			if he, ok := err.(*echo.HTTPError); ok {
				if he.Code == http.StatusNotFound {
					// 404エラーの場合はカスタム404ページを返す
					return c.File("public/404.html")
				}
			}
			return err
		}
		
		return nil
	}
}

func main() {
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(custom404Handler)

	// 1. 基本的な静的ファイル配信
	e.Static("/static", "public")

	// 2. 複数のディレクトリからの配信
	e.Static("/assets", "assets")
	e.Static("/uploads", "uploads")

	// 3. インデックスページの配信
	e.GET("/", func(c echo.Context) error {
		return c.File("public/index.html")
	})

	// ディレクトリが存在するか確認し、なければ作成
	dirs := []string{"public", "public/css", "assets", "uploads"}
	for _, dir := range dirs {
		if _, err := os.Stat(dir); os.IsNotExist(err) {
			os.MkdirAll(dir, 0755)
		}
	}

	// サンプルファイルの作成（実際のアプリケーションでは不要）
	createSampleFiles()

	e.Logger.Fatal(e.Start(":8080"))
}

// サンプルファイルの作成（実際のアプリケーションでは不要）
func createSampleFiles() {
	// インデックスページ
	indexHTML := `<!DOCTYPE html>
<html>
<head>
    <title>Echo Static Files</title>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
    <h1>Welcome to Echo Static Files Demo</h1>
    <p>This is the index page served from public/index.html</p>
    <ul>
        <li><a href="/static/css/style.css">CSS File</a></li>
        <li><a href="/assets/sample.txt">Asset File</a></li>
        <li><a href="/uploads/example.txt">Upload File</a></li>
        <li><a href="/nonexistent">404 Page</a></li>
    </ul>
</body>
</html>`

	// CSSファイル
	cssContent := `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
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
}`

	// アセットファイル
	assetContent := "This is a sample asset file."

	// アップロードファイル
	uploadContent := "This is a sample upload file."

	// 404ページ
	notFoundHTML := `<!DOCTYPE html>
<html>
<head>
    <title>404 - Page Not Found</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            text-align: center;
        }
        
        h1 {
            color: #e74c3c;
        }
        
        .container {
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        a {
            color: #0066cc;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <p><a href="/">Return to Home</a></p>
    </div>
</body>
</html>`

	// ファイルの書き込み
	os.WriteFile("public/index.html", []byte(indexHTML), 0644)
	os.WriteFile("public/css/style.css", []byte(cssContent), 0644)
	os.WriteFile("assets/sample.txt", []byte(assetContent), 0644)
	os.WriteFile("uploads/example.txt", []byte(uploadContent), 0644)
	os.WriteFile("public/404.html", []byte(notFoundHTML), 0644)
}
```
