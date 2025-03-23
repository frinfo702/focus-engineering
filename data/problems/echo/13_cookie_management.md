---
title: "クッキー管理"
description: "Echoフレームワークでのクッキーの設定と取得"
difficulty: "Easy"
category: "cookies"
relatedResources:
  - title: "Echo公式ドキュメント - クッキー"
    url: "https://echo.labstack.com/docs/cookies"
    description: "Echoフレームワーク公式のクッキー操作解説"
    type: "documentation"
---

# Cookieの操作

## 問題

Echoフレームワークを使用して、以下の要件を満たすCookie操作を実装してください：

1. 基本的なCookieの設定：
   - `/set-cookie` エンドポイントで、名前が「username」、値がクエリパラメータから取得した値のCookieを設定する
   - Cookieの有効期限を24時間に設定する

2. セキュアなCookieの設定：
   - `/set-secure-cookie` エンドポイントで、HTTPSでのみ送信されるセキュアなCookieを設定する
   - HttpOnly属性を有効にして、JavaScriptからのアクセスを防止する
   - SameSite属性を「Strict」に設定する

3. Cookieの取得と表示：
   - `/get-cookies` エンドポイントで、すべてのCookieを取得して表示する

4. 特定のCookieの削除：
   - `/delete-cookie` エンドポイントで、名前がクエリパラメータで指定されたCookieを削除する

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
	"time"
)

func main() {
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// 基本的なCookieの設定
	e.GET("/set-cookie", func(c echo.Context) error {
		// ここに基本的なCookieの設定を実装してください
		return c.String(http.StatusOK, "Cookie set")
	})

	// セキュアなCookieの設定
	e.GET("/set-secure-cookie", func(c echo.Context) error {
		// ここにセキュアなCookieの設定を実装してください
		return c.String(http.StatusOK, "Secure cookie set")
	})

	// Cookieの取得と表示
	e.GET("/get-cookies", func(c echo.Context) error {
		// ここにCookieの取得と表示を実装してください
		return c.String(http.StatusOK, "Cookies")
	})

	// 特定のCookieの削除
	e.GET("/delete-cookie", func(c echo.Context) error {
		// ここに特定のCookieの削除を実装してください
		return c.String(http.StatusOK, "Cookie deleted")
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```

## 解答例

```go
package main

import (
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
	"strings"
	"time"
)

func main() {
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// 基本的なCookieの設定
	e.GET("/set-cookie", func(c echo.Context) error {
		// クエリパラメータからユーザー名を取得
		username := c.QueryParam("username")
		if username == "" {
			return c.String(http.StatusBadRequest, "Username is required")
		}
		
		// Cookieの作成
		cookie := new(http.Cookie)
		cookie.Name = "username"
		cookie.Value = username
		cookie.Expires = time.Now().Add(24 * time.Hour) // 24時間の有効期限
		cookie.Path = "/"
		
		// Cookieの設定
		c.SetCookie(cookie)
		
		return c.String(http.StatusOK, fmt.Sprintf("Cookie 'username' set to '%s'", username))
	})

	// セキュアなCookieの設定
	e.GET("/set-secure-cookie", func(c echo.Context) error {
		// クエリパラメータから値を取得
		value := c.QueryParam("value")
		if value == "" {
			return c.String(http.StatusBadRequest, "Value is required")
		}
		
		// セキュアなCookieの作成
		cookie := new(http.Cookie)
		cookie.Name = "secure-data"
		cookie.Value = value
		cookie.Expires = time.Now().Add(1 * time.Hour) // 1時間の有効期限
		cookie.Path = "/"
		cookie.Secure = true   // HTTPSでのみ送信
		cookie.HttpOnly = true // JavaScriptからのアクセスを防止
		cookie.SameSite = http.SameSiteStrictMode // 同一サイトからのリクエストのみ
		
		// Cookieの設定
		c.SetCookie(cookie)
		
		return c.String(http.StatusOK, fmt.Sprintf("Secure cookie 'secure-data' set to '%s'", value))
	})

	// Cookieの取得と表示
	e.GET("/get-cookies", func(c echo.Context) error {
		// リクエストからすべてのCookieを取得
		cookies := c.Cookies()
		
		if len(cookies) == 0 {
			return c.String(http.StatusOK, "No cookies found")
		}
		
		// Cookieの情報を構築
		var cookieInfo strings.Builder
		cookieInfo.WriteString("Cookies found:\n")
		
		for i, cookie := range cookies {
			cookieInfo.WriteString(fmt.Sprintf("%d. %s = %s\n", i+1, cookie.Name, cookie.Value))
			cookieInfo.WriteString(fmt.Sprintf("   Path: %s\n", cookie.Path))
			cookieInfo.WriteString(fmt.Sprintf("   Expires: %s\n", cookie.Expires))
			cookieInfo.WriteString(fmt.Sprintf("   Secure: %t\n", cookie.Secure))
			cookieInfo.WriteString(fmt.Sprintf("   HttpOnly: %t\n", cookie.HttpOnly))
			cookieInfo.WriteString(fmt.Sprintf("   SameSite: %d\n", cookie.SameSite))
			cookieInfo.WriteString("\n")
		}
		
		return c.String(http.StatusOK, cookieInfo.String())
	})

	// 特定のCookieの削除
	e.GET("/delete-cookie", func(c echo.Context) error {
		// クエリパラメータからCookie名を取得
		name := c.QueryParam("name")
		if name == "" {
			return c.String(http.StatusBadRequest, "Cookie name is required")
		}
		
		// 指定されたCookieを削除（有効期限を過去に設定）
		cookie := new(http.Cookie)
		cookie.Name = name
		cookie.Value = ""
		cookie.Expires = time.Unix(0, 0) // 1970-01-01 00:00:00 UTC
		cookie.Path = "/"
		cookie.MaxAge = -1 // 即時削除
		
		// Cookieの設定
		c.SetCookie(cookie)
		
		return c.String(http.StatusOK, fmt.Sprintf("Cookie '%s' deleted", name))
	})

	// テスト用のHTMLページ
	e.GET("/", func(c echo.Context) error {
		html := `
<!DOCTYPE html>
<html>
<head>
    <title>Cookie Management</title>
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
        .section {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        label {
            display: inline-block;
            width: 100px;
        }
        input {
            padding: 5px;
            margin-right: 10px;
        }
        button {
            padding: 5px 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #45a049;
        }
        pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Cookie Management Demo</h1>
        
        <div class="section">
            <h2>Set Basic Cookie</h2>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username">
            <button onclick="setBasicCookie()">Set Cookie</button>
            <pre id="basic-result"></pre>
        </div>
        
        <div class="section">
            <h2>Set Secure Cookie</h2>
            <label for="secure-value">Value:</label>
            <input type="text" id="secure-value" name="secure-value">
            <button onclick="setSecureCookie()">Set Secure Cookie</button>
            <pre id="secure-result"></pre>
        </div>
        
        <div class="section">
            <h2>Get All Cookies</h2>
            <button onclick="getCookies()">Get Cookies</button>
            <pre id="get-result"></pre>
        </div>
        
        <div class="section">
            <h2>Delete Cookie</h2>
            <label for="cookie-name">Cookie Name:</label>
            <input type="text" id="cookie-name" name="cookie-name">
            <button onclick="deleteCookie()">Delete Cookie</button>
            <pre id="delete-result"></pre>
        </div>
    </div>
    
    <script>
        async function setBasicCookie() {
            const username = document.getElementById('username').value;
            if (!username) {
                document.getElementById('basic-result').textContent = 'Username is required';
                return;
            }
            
            try {
                const response = await fetch('/set-cookie?username=' + encodeURIComponent(username));
                const text = await response.text();
                document.getElementById('basic-result').textContent = text;
            } catch (error) {
                document.getElementById('basic-result').textContent = 'Error: ' + error.message;
            }
        }
        
        async function setSecureCookie() {
            const value = document.getElementById('secure-value').value;
            if (!value) {
                document.getElementById('secure-result').textContent = 'Value is required';
                return;
            }
            
            try {
                const response = await fetch('/set-secure-cookie?value=' + encodeURIComponent(value));
                const text = await response.text();
                document.getElementById('secure-result').textContent = text;
            } catch (error) {
                document.getElementById('secure-result').textContent = 'Error: ' + error.message;
            }
        }
        
        async function getCookies() {
            try {
                const response = await fetch('/get-cookies');
                const text = await response.text();
                document.getElementById('get-result').textContent = text;
            } catch (error) {
                document.getElementById('get-result').textContent = 'Error: ' + error.message;
            }
        }
        
        async function deleteCookie() {
            const name = document.getElementById('cookie-name').value;
            if (!name) {
                document.getElementById('delete-result').textContent = 'Cookie name is required';
                return;
            }
            
            try {
                const response = await fetch('/delete-cookie?name=' + encodeURIComponent(name));
                const text = await response.text();
                document.getElementById('delete-result').textContent = text;
            } catch (error) {
                document.getElementById('delete-result').textContent = 'Error: ' + error.message;
            }
        }
    </script>
</body>
</html>
`
		return c.HTML(http.StatusOK, html)
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```
