---
title: "リクエストバリデーション"
description: "Echoフレームワークでリクエストデータのバリデーションを実装する"
difficulty: "Medium"
category: "data-binding"
---

# リクエストバリデーション

## 問題

Echoフレームワークを使用して、ユーザー登録APIを実装してください。以下の要件を満たす必要があります：

1. POST `/api/users/register` エンドポイントを作成
2. リクエストボディから以下のフィールドを持つJSONデータを受け取る：
   - `username`: 文字列（3〜20文字、必須）
   - `email`: 有効なメールアドレス形式（必須）
   - `password`: 文字列（8文字以上、必須）
   - `age`: 数値（18以上、必須）

3. バリデーションエラーが発生した場合、以下の形式のJSONレスポンスを返す：
   ```json
   {
     "status": 400,
     "errors": [
       {"field": "username", "message": "Username is required"},
       {"field": "password", "message": "Password must be at least 8 characters"}
     ]
   }
   ```

4. バリデーションが成功した場合、ステータスコード201と登録されたユーザー情報（パスワードを除く）を返す

## ベースコード

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

// User はユーザー情報を表す構造体です
type User struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Age      int    `json:"age"`
}

// ValidationError はバリデーションエラーを表す構造体です
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ErrorResponse はエラーレスポンスを表す構造体です
type ErrorResponse struct {
	Status int               `json:"status"`
	Errors []ValidationError `json:"errors"`
}

func main() {
	e := echo.New()
	
	// ユーザー登録エンドポイントを実装してください
	
	e.Start(":8080")
}
```

## 解答例

```go
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"net/mail"
	"strings"
)

// User はユーザー情報を表す構造体です
type User struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password,omitempty"` // レスポンスではパスワードを除外
	Age      int    `json:"age"`
}

// ValidationError はバリデーションエラーを表す構造体です
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ErrorResponse はエラーレスポンスを表す構造体です
type ErrorResponse struct {
	Status int               `json:"status"`
	Errors []ValidationError `json:"errors"`
}

// validateUser はユーザーデータのバリデーションを行います
func validateUser(user *User) []ValidationError {
	var errors []ValidationError
	
	// ユーザー名のバリデーション
	if strings.TrimSpace(user.Username) == "" {
		errors = append(errors, ValidationError{Field: "username", Message: "Username is required"})
	} else if len(user.Username) < 3 || len(user.Username) > 20 {
		errors = append(errors, ValidationError{Field: "username", Message: "Username must be between 3 and 20 characters"})
	}
	
	// メールアドレスのバリデーション
	if strings.TrimSpace(user.Email) == "" {
		errors = append(errors, ValidationError{Field: "email", Message: "Email is required"})
	} else {
		_, err := mail.ParseAddress(user.Email)
		if err != nil {
			errors = append(errors, ValidationError{Field: "email", Message: "Invalid email format"})
		}
	}
	
	// パスワードのバリデーション
	if strings.TrimSpace(user.Password) == "" {
		errors = append(errors, ValidationError{Field: "password", Message: "Password is required"})
	} else if len(user.Password) < 8 {
		errors = append(errors, ValidationError{Field: "password", Message: "Password must be at least 8 characters"})
	}
	
	// 年齢のバリデーション
	if user.Age < 18 {
		errors = append(errors, ValidationError{Field: "age", Message: "Age must be 18 or older"})
	}
	
	return errors
}

func main() {
	e := echo.New()
	
	// ユーザー登録エンドポイント
	e.POST("/api/users/register", func(c echo.Context) error {
		user := new(User)
		
		// リクエストボディをバインド
		if err := c.Bind(user); err != nil {
			return c.JSON(http.StatusBadRequest, ErrorResponse{
				Status: http.StatusBadRequest,
				Errors: []ValidationError{{Field: "request", Message: "Invalid request body"}},
			})
		}
		
		// バリデーション実行
		validationErrors := validateUser(user)
		if len(validationErrors) > 0 {
			return c.JSON(http.StatusBadRequest, ErrorResponse{
				Status: http.StatusBadRequest,
				Errors: validationErrors,
			})
		}
		
		// バリデーション成功
		// 実際のアプリケーションではここでデータベースへの保存などを行う
		
		// パスワードを除外してレスポンスを返す
		user.Password = ""
		return c.JSON(http.StatusCreated, user)
	})
	
	e.Start(":8080")
}
```
