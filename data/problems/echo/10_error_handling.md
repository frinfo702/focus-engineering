---
title: "エラーハンドリング"
description: "Echoフレームワークでの効果的なエラーハンドリングの実装"
difficulty: "Medium"
category: "error-handling"
relatedResources:
  - title: "Echo公式ドキュメント - エラーハンドリング"
    url: "https://echo.labstack.com/docs/error-handling"
    description: "Echoフレームワーク公式のエラーハンドリング解説"
    type: "documentation"
---

# エラーハンドリング

## 問題

Echoフレームワークを使用して、以下の要件を満たすエラーハンドリングを実装してください：

1. カスタムHTTPエラーハンドラー：
   - 404 Not Foundエラーに対して、JSONフォーマットでエラー情報を返す
   - 500 Internal Server Errorに対して、JSONフォーマットでエラー情報を返す（詳細なエラー情報は本番環境では非表示）

2. バリデーションエラーのハンドリング：
   - リクエストデータのバリデーションエラーを適切に処理し、422 Unprocessable Entityステータスコードで返す

3. カスタムエラー型の定義と処理：
   - アプリケーション固有のエラー型を定義し、適切なHTTPステータスコードにマッピング
   - 例：`ResourceNotFoundError`、`ValidationError`、`AuthorizationError`など

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

// カスタムエラー型
type AppError struct {
	// ここにカスタムエラー型を定義してください
}

// ユーザー情報の構造体
type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name" validate:"required"`
	Email string `json:"email" validate:"required,email"`
	Age   int    `json:"age" validate:"gte=0,lte=130"`
}

// カスタムHTTPエラーハンドラー
func customHTTPErrorHandler(err error, c echo.Context) {
	// ここにカスタムHTTPエラーハンドラーを実装してください
}

// バリデーションエラーのハンドリング
func handleValidationErrors(err error) *AppError {
	// ここにバリデーションエラーのハンドリングを実装してください
	return nil
}

func main() {
	e := echo.New()
	
	// カスタムHTTPエラーハンドラーの設定
	e.HTTPErrorHandler = customHTTPErrorHandler

	// 存在しないリソースへのアクセス（404エラー）
	e.GET("/users/:id", func(c echo.Context) error {
		// 存在しないユーザーIDの場合は404エラーを返す
		id := c.Param("id")
		if id == "999" {
			return echo.NewHTTPError(http.StatusNotFound, "User not found")
		}
		return c.JSON(http.StatusOK, map[string]string{"id": id, "name": "John Doe"})
	})

	// サーバーエラー（500エラー）
	e.GET("/error", func(c echo.Context) error {
		// 意図的にサーバーエラーを発生させる
		return echo.NewHTTPError(http.StatusInternalServerError, "Something went wrong")
	})

	// バリデーションエラー
	e.POST("/users", func(c echo.Context) error {
		// ここにバリデーションエラーのテストコードを実装してください
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
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"net/http"
	"os"
	"strings"
)

// カスタムエラー型
type AppError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

// Error インターフェースの実装
func (e *AppError) Error() string {
	return e.Message
}

// ユーザー情報の構造体
type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name" validate:"required"`
	Email string `json:"email" validate:"required,email"`
	Age   int    `json:"age" validate:"gte=0,lte=130"`
}

// リソースが見つからないエラー
func NewResourceNotFoundError(resource string, id string) *AppError {
	return &AppError{
		Code:    http.StatusNotFound,
		Message: fmt.Sprintf("%s with ID %s not found", resource, id),
		Details: "The requested resource does not exist or has been removed",
	}
}

// バリデーションエラー
func NewValidationError(details string) *AppError {
	return &AppError{
		Code:    http.StatusUnprocessableEntity,
		Message: "Validation failed",
		Details: details,
	}
}

// 認証エラー
func NewAuthorizationError() *AppError {
	return &AppError{
		Code:    http.StatusForbidden,
		Message: "Access denied",
		Details: "You do not have permission to access this resource",
	}
}

// サーバーエラー
func NewServerError(err error) *AppError {
	// 本番環境ではエラー詳細を隠す
	details := "An unexpected error occurred"
	if os.Getenv("APP_ENV") != "production" {
		details = err.Error()
	}
	
	return &AppError{
		Code:    http.StatusInternalServerError,
		Message: "Internal server error",
		Details: details,
	}
}

// カスタムHTTPエラーハンドラー
func customHTTPErrorHandler(err error, c echo.Context) {
	var (
		code    = http.StatusInternalServerError
		message = "Internal Server Error"
		details = "An unexpected error occurred"
	)

	// 本番環境かどうかを確認
	isProduction := os.Getenv("APP_ENV") == "production"

	// AppErrorの場合
	if appErr, ok := err.(*AppError); ok {
		code = appErr.Code
		message = appErr.Message
		if !isProduction || code < 500 {
			details = appErr.Details
		}
	} else if httpErr, ok := err.(*echo.HTTPError); ok {
		// Echoの標準HTTPエラーの場合
		code = httpErr.Code
		message = fmt.Sprintf("%v", httpErr.Message)
		
		// 内部エラーの詳細は本番環境では非表示
		if !isProduction || code < 500 {
			if httpErr.Internal != nil {
				details = httpErr.Internal.Error()
			} else {
				details = message
			}
		}
	} else {
		// その他のエラーの場合
		if !isProduction {
			details = err.Error()
		}
	}

	// JSONレスポンスを返す
	if !c.Response().Committed {
		if c.Request().Method == http.MethodHead {
			c.NoContent(code)
		} else {
			c.JSON(code, map[string]interface{}{
				"error": map[string]interface{}{
					"code":    code,
					"message": message,
					"details": details,
				},
			})
		}
	}
}

// バリデーションエラーのハンドリング
func handleValidationErrors(err error) *AppError {
	if validationErrs, ok := err.(validator.ValidationErrors); ok {
		var errorDetails []string
		
		for _, e := range validationErrs {
			field := e.Field()
			switch e.Tag() {
			case "required":
				errorDetails = append(errorDetails, fmt.Sprintf("Field '%s' is required", field))
			case "email":
				errorDetails = append(errorDetails, fmt.Sprintf("Field '%s' must be a valid email address", field))
			case "gte":
				errorDetails = append(errorDetails, fmt.Sprintf("Field '%s' must be greater than or equal to %s", field, e.Param()))
			case "lte":
				errorDetails = append(errorDetails, fmt.Sprintf("Field '%s' must be less than or equal to %s", field, e.Param()))
			default:
				errorDetails = append(errorDetails, fmt.Sprintf("Field '%s' failed validation: %s", field, e.Tag()))
			}
		}
		
		return NewValidationError(strings.Join(errorDetails, "; "))
	}
	
	return NewValidationError(err.Error())
}

func main() {
	e := echo.New()
	
	// カスタムHTTPエラーハンドラーの設定
	e.HTTPErrorHandler = customHTTPErrorHandler
	
	// バリデーターの設定
	validate := validator.New()

	// 存在しないリソースへのアクセス（404エラー）
	e.GET("/users/:id", func(c echo.Context) error {
		id := c.Param("id")
		if id == "999" {
			return NewResourceNotFoundError("User", id)
		}
		return c.JSON(http.StatusOK, map[string]string{"id": id, "name": "John Doe"})
	})

	// サーバーエラー（500エラー）
	e.GET("/error", func(c echo.Context) error {
		// 意図的にサーバーエラーを発生させる
		err := fmt.Errorf("database connection failed: connection refused")
		return NewServerError(err)
	})

	// バリデーションエラー
	e.POST("/users", func(c echo.Context) error {
		user := new(User)
		
		// リクエストボディをバインド
		if err := c.Bind(user); err != nil {
			return NewValidationError("Invalid request format")
		}
		
		// バリデーション
		if err := validate.Struct(user); err != nil {
			return handleValidationErrors(err)
		}
		
		// 成功レスポンス
		return c.JSON(http.StatusCreated, map[string]interface{}{
			"message": "User created successfully",
			"user":    user,
		})
	})

	// 認証エラーのテスト
	e.GET("/admin", func(c echo.Context) error {
		// 認証トークンの確認（簡易的な例）
		token := c.QueryParam("token")
		if token != "secret-admin-token" {
			return NewAuthorizationError()
		}
		
		return c.String(http.StatusOK, "Welcome to admin area")
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```
