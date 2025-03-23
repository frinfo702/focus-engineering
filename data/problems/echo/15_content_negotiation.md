---
title: "コンテントネゴシエーション"
description: "Echoフレームワークでのコンテントネゴシエーションの実装"
difficulty: "Medium"
category: "response"
relatedResources:
  - title: "Echo公式ドキュメント - レスポンス"
    url: "https://echo.labstack.com/docs/response"
    description: "Echoフレームワーク公式のレスポンス処理解説"
    type: "documentation"
  - title: "MDN - コンテントネゴシエーション"
    url: "https://developer.mozilla.org/ja/docs/Web/HTTP/Content_negotiation"
    description: "HTTPにおけるコンテントネゴシエーションの解説"
    type: "article"
---

# Content Negotiation

## 問題

Echoフレームワークを使用して、以下の要件を満たすContent Negotiation（コンテントネゴシエーション）を実装してください：

1. 単一エンドポイントから複数のフォーマットでのレスポンス：
   - `/api/product/:id` エンドポイントで、クライアントのAcceptヘッダーに基づいて以下のフォーマットでレスポンスを返す：
     - `application/json`: JSON形式
     - `application/xml`: XML形式
     - `text/html`: HTML形式
     - `text/plain`: プレーンテキスト形式

2. デフォルトフォーマットの設定：
   - Acceptヘッダーが指定されていない場合や、サポートされていないフォーマットが要求された場合は、JSONをデフォルトとして返す

3. 言語ネゴシエーション：
   - Accept-Languageヘッダーに基づいて、以下の言語でメッセージを返す：
     - `en`: 英語
     - `ja`: 日本語
     - `fr`: フランス語
   - サポートされていない言語が要求された場合は、英語をデフォルトとして返す

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
)

// 製品情報の構造体
type Product struct {
	ID          string  `json:"id" xml:"id"`
	Name        string  `json:"name" xml:"name"`
	Description string  `json:"description" xml:"description"`
	Price       float64 `json:"price" xml:"price"`
	Category    string  `json:"category" xml:"category"`
}

// 言語別のメッセージ
var messages = map[string]map[string]string{
	"en": {
		"product_found":    "Product found",
		"product_not_found": "Product not found",
	},
	"ja": {
		"product_found":    "製品が見つかりました",
		"product_not_found": "製品が見つかりません",
	},
	"fr": {
		"product_found":    "Produit trouvé",
		"product_not_found": "Produit non trouvé",
	},
}

// サンプル製品データ
var products = map[string]Product{
	"1": {
		ID:          "1",
		Name:        "Smartphone",
		Description: "Latest model smartphone with high-end features",
		Price:       999.99,
		Category:    "Electronics",
	},
	"2": {
		ID:          "2",
		Name:        "Laptop",
		Description: "Powerful laptop for professional use",
		Price:       1499.99,
		Category:    "Electronics",
	},
}

func main() {
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// 製品情報API
	e.GET("/api/product/:id", func(c echo.Context) error {
		// ここにContent Negotiationを実装してください
		return nil
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
)

// 製品情報の構造体
type Product struct {
	ID          string  `json:"id" xml:"id"`
	Name        string  `json:"name" xml:"name"`
	Description string  `json:"description" xml:"description"`
	Price       float64 `json:"price" xml:"price"`
	Category    string  `json:"category" xml:"category"`
}

// 言語別のメッセージ
var messages = map[string]map[string]string{
	"en": {
		"product_found":    "Product found",
		"product_not_found": "Product not found",
	},
	"ja": {
		"product_found":    "製品が見つかりました",
		"product_not_found": "製品が見つかりません",
	},
	"fr": {
		"product_found":    "Produit trouvé",
		"product_not_found": "Produit non trouvé",
	},
}

// サンプル製品データ
var products = map[string]Product{
	"1": {
		ID:          "1",
		Name:        "Smartphone",
		Description: "Latest model smartphone with high-end features",
		Price:       999.99,
		Category:    "Electronics",
	},
	"2": {
		ID:          "2",
		Name:        "Laptop",
		Description: "Powerful laptop for professional use",
		Price:       1499.99,
		Category:    "Electronics",
	},
}

// 言語の取得
func getLanguage(c echo.Context) string {
	// Accept-Languageヘッダーを取得
	acceptLanguage := c.Request().Header.Get("Accept-Language")
	
	if acceptLanguage == "" {
		return "en" // デフォルトは英語
	}
	
	// Accept-Languageヘッダーをパース
	// 例: "ja,en-US;q=0.9,en;q=0.8"
	langs := strings.Split(acceptLanguage, ",")
	
	// 最初の言語コードを取得（品質値は無視）
	for _, lang := range langs {
		// 言語コードのみを取得（サブタグや品質値を除去）
		langCode := strings.Split(strings.Split(lang, ";")[0], "-")[0]
		
		// サポートされている言語かチェック
		if _, ok := messages[langCode]; ok {
			return langCode
		}
	}
	
	return "en" // サポートされていない言語の場合は英語
}

// HTMLテンプレートの生成
func generateHTML(product Product, lang string) string {
	message := messages[lang]["product_found"]
	
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <title>%s - %s</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        .product {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
            max-width: 600px;
        }
        .product h1 {
            color: #333;
            margin-top: 0;
        }
        .price {
            font-size: 1.2em;
            font-weight: bold;
            color: #e74c3c;
        }
        .category {
            background-color: #f8f9fa;
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.8em;
        }
    </style>
</head>
<body>
    <div class="product">
        <h1>%s</h1>
        <p>%s</p>
        <p class="price">$%.2f</p>
        <p><span class="category">%s</span></p>
        <p><em>%s</em></p>
    </div>
</body>
</html>
`, product.Name, message, product.Name, product.Description, product.Price, product.Category, message)

	return html
}

// プレーンテキストの生成
func generatePlainText(product Product, lang string) string {
	message := messages[lang]["product_found"]
	
	text := fmt.Sprintf(`%s

ID: %s
Name: %s
Description: %s
Price: $%.2f
Category: %s
`, message, product.ID, product.Name, product.Description, product.Price, product.Category)

	return text
}

// 製品が見つからない場合のレスポンス
func productNotFoundResponse(c echo.Context, lang string) error {
	message := messages[lang]["product_not_found"]
	
	// Acceptヘッダーを取得
	accept := c.Request().Header.Get("Accept")
	
	// コンテントタイプの判定
	if strings.Contains(accept, "application/xml") {
		return c.XML(http.StatusNotFound, map[string]string{"error": message})
	} else if strings.Contains(accept, "text/html") {
		html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <title>%s</title>
</head>
<body>
    <h1>%s</h1>
    <p>The requested product could not be found.</p>
</body>
</html>
`, message, message)
		return c.HTML(http.StatusNotFound, html)
	} else if strings.Contains(accept, "text/plain") {
		return c.String(http.StatusNotFound, message)
	} else {
		// デフォルトはJSON
		return c.JSON(http.StatusNotFound, map[string]string{"error": message})
	}
}

func main() {
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// 製品情報API
	e.GET("/api/product/:id", func(c echo.Context) error {
		// 製品IDを取得
		id := c.Param("id")
		
		// 言語を取得
		lang := getLanguage(c)
		
		// 製品データを取得
		product, exists := products[id]
		if !exists {
			return productNotFoundResponse(c, lang)
		}
		
		// Acceptヘッダーを取得
		accept := c.Request().Header.Get("Accept")
		
		// コンテントタイプの判定とレスポンスの返却
		if strings.Contains(accept, "application/xml") {
			// XML形式
			return c.XML(http.StatusOK, struct {
				Message string  `xml:"message"`
				Product Product `xml:"product"`
			}{
				Message: messages[lang]["product_found"],
				Product: product,
			})
		} else if strings.Contains(accept, "text/html") {
			// HTML形式
			return c.HTML(http.StatusOK, generateHTML(product, lang))
		} else if strings.Contains(accept, "text/plain") {
			// プレーンテキスト形式
			return c.String(http.StatusOK, generatePlainText(product, lang))
		} else {
			// デフォルトはJSON形式
			return c.JSON(http.StatusOK, map[string]interface{}{
				"message": messages[lang]["product_found"],
				"product": product,
			})
		}
	})

	// テスト用のHTMLページ
	e.GET("/", func(c echo.Context) error {
		html := `
<!DOCTYPE html>
<html>
<head>
    <title>Content Negotiation Demo</title>
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
        h1, h2 {
            color: #333;
        }
        .section {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        code {
            background-color: #f5f5f5;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: monospace;
        }
        button {
            padding: 8px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        button:hover {
            background-color: #45a049;
        }
        pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        select {
            padding: 5px;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Content Negotiation Demo</h1>
        <p>This demo shows how to implement content negotiation in Echo framework.</p>
        
        <div class="section">
            <h2>Test Content Negotiation</h2>
            <p>Select a product, format, and language to test the API:</p>
            
            <div>
                <label for="product">Product:</label>
                <select id="product">
                    <option value="1">Smartphone (ID: 1)</option>
                    <option value="2">Laptop (ID: 2)</option>
                    <option value="999">Non-existent Product (ID: 999)</option>
                </select>
            </div>
            
            <div style="margin-top: 10px;">
                <label for="format">Format:</label>
                <select id="format">
                    <option value="application/json">JSON</option>
                    <option value="application/xml">XML</option>
                    <option value="text/html">HTML</option>
                    <option value="text/plain">Plain Text</option>
                </select>
            </div>
            
            <div style="margin-top: 10px;">
                <label for="language">Language:</label>
                <select id="language">
                    <option value="en">English</option>
                    <option value="ja">Japanese</option>
                    <option value="fr">French</option>
                </select>
            </div>
            
            <div style="margin-top: 15px;">
                <button onclick="testAPI()">Test API</button>
                <button onclick="clearResult()">Clear Result</button>
            </div>
            
            <div style="margin-top: 15px;">
                <h3>Result:</h3>
                <pre id="result">Results will appear here...</pre>
            </div>
        </div>
        
        <div class="section">
            <h2>API Endpoints</h2>
            <p>The following endpoint supports content negotiation:</p>
            <ul>
                <li><code>GET /api/product/:id</code> - Get product information in different formats</li>
            </ul>
        </div>
    </div>
    
    <script>
        async function testAPI() {
            const productId = document.getElementById('product').value;
            const format = document.getElementById('format').value;
            const language = document.getElementById('language').value;
            
            try {
                const response = await fetch('/api/product/' + productId, {
                    headers: {
                        'Accept': format,
                        'Accept-Language': language
                    }
                });
                
                const contentType = response.headers.get('Content-Type');
                let result;
                
                if (contentType.includes('application/json')) {
                    result = await response.json();
                    document.getElementById('result').textContent = JSON.stringify(result, null, 2);
                } else if (contentType.includes('application/xml')) {
                    result = await response.text();
                    document.getElementById('result').textContent = result;
                } else if (contentType.includes('text/html')) {
                    result = await response.text();
                    document.getElementById('result').textContent = result;
                } else {
                    result = await response.text();
                    document.getElementById('result').textContent = result;
                }
            } catch (error) {
                document.getElementById('result').textContent = 'Error: ' + error.message;
            }
        }
        
        function clearResult() {
            document.getElementById('result').textContent = 'Results will appear here...';
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
