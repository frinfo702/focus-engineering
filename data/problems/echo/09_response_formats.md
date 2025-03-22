---
title: "レスポンス形式"
description: "Echoフレームワークでの様々なレスポンス形式の実装"
difficulty: "Easy"
category: "response"
---

# レスポンス形式

## 問題

Echoフレームワークを使用して、以下の要件を満たす様々なレスポンス形式を実装してください：

1. テキストレスポンス：
   - `/text` エンドポイントで、「Hello, Echo!」というプレーンテキストを返す

2. JSONレスポンス：
   - `/json` エンドポイントで、以下のJSONを返す
   ```json
   {
     "message": "Success",
     "data": {
       "name": "Echo Framework",
       "version": "4.x",
       "features": ["Fast", "Simple", "Minimalist"]
     }
   }
   ```

3. HTMLレスポンス：
   - `/html` エンドポイントで、簡単なHTML（h1タグとpタグを含む）を返す

4. XMLレスポンス：
   - `/xml` エンドポイントで、簡単なXMLデータを返す

5. ステータスコードの設定：
   - `/created` エンドポイントで、201 Createdステータスコードとメッセージを返す
   - `/error` エンドポイントで、400 Bad Requestステータスコードとエラーメッセージを返す

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

// XMLデータ用の構造体
type Person struct {
	// ここにXMLデータ用の構造体を定義してください
}

func main() {
	e := echo.New()

	// テキストレスポンス
	e.GET("/text", func(c echo.Context) error {
		// ここにテキストレスポンスを実装してください
		return nil
	})

	// JSONレスポンス
	e.GET("/json", func(c echo.Context) error {
		// ここにJSONレスポンスを実装してください
		return nil
	})

	// HTMLレスポンス
	e.GET("/html", func(c echo.Context) error {
		// ここにHTMLレスポンスを実装してください
		return nil
	})

	// XMLレスポンス
	e.GET("/xml", func(c echo.Context) error {
		// ここにXMLレスポンスを実装してください
		return nil
	})

	// ステータスコードの設定
	e.GET("/created", func(c echo.Context) error {
		// ここに201 Createdレスポンスを実装してください
		return nil
	})

	e.GET("/error", func(c echo.Context) error {
		// ここに400 Bad Requestレスポンスを実装してください
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
	"net/http"
)

// XMLデータ用の構造体
type Person struct {
	XMLName   struct{} `xml:"person"`
	ID        int      `xml:"id"`
	Name      string   `xml:"name"`
	Email     string   `xml:"email"`
	Addresses []Address `xml:"addresses>address"`
}

type Address struct {
	City  string `xml:"city"`
	State string `xml:"state"`
}

func main() {
	e := echo.New()

	// テキストレスポンス
	e.GET("/text", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, Echo!")
	})

	// JSONレスポンス
	e.GET("/json", func(c echo.Context) error {
		data := map[string]interface{}{
			"message": "Success",
			"data": map[string]interface{}{
				"name":     "Echo Framework",
				"version":  "4.x",
				"features": []string{"Fast", "Simple", "Minimalist"},
			},
		}
		return c.JSON(http.StatusOK, data)
	})

	// HTMLレスポンス
	e.GET("/html", func(c echo.Context) error {
		html := `
<!DOCTYPE html>
<html>
<head>
    <title>Echo Framework</title>
</head>
<body>
    <h1>Welcome to Echo</h1>
    <p>Echo is a high performance, extensible, minimalist web framework for Go.</p>
</body>
</html>
`
		return c.HTML(http.StatusOK, html)
	})

	// XMLレスポンス
	e.GET("/xml", func(c echo.Context) error {
		person := &Person{
			ID:    1,
			Name:  "John Doe",
			Email: "john@example.com",
			Addresses: []Address{
				{City: "New York", State: "NY"},
				{City: "Boston", State: "MA"},
			},
		}
		return c.XML(http.StatusOK, person)
	})

	// ステータスコードの設定 - 201 Created
	e.GET("/created", func(c echo.Context) error {
		return c.JSON(http.StatusCreated, map[string]string{
			"message": "Resource created successfully",
			"id":      "12345",
		})
	})

	// ステータスコードの設定 - 400 Bad Request
	e.GET("/error", func(c echo.Context) error {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":   "Bad Request",
			"message": "Invalid parameters provided",
		})
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```
