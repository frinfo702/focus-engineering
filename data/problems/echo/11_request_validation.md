---
title: "リクエストバリデーション"
description: "Echoフレームワークでのリクエストデータのバリデーション"
difficulty: "Medium"
category: "validation"
---

# リクエストバリデーション

## 問題

Echoフレームワークを使用して、以下の要件を満たすリクエストバリデーションを実装してください：

1. 基本的なバリデーション：
   - ユーザー登録APIで、名前（必須）、メールアドレス（必須、有効な形式）、年齢（0以上130以下）、パスワード（8文字以上）のバリデーション

2. カスタムバリデーションルール：
   - パスワードの強度チェック（大文字、小文字、数字、特殊文字を含む）
   - ユーザー名の形式チェック（英数字とアンダースコアのみ、3〜20文字）

3. バリデーションエラーの適切なレスポンス：
   - エラーメッセージを明確に表示
   - 複数のバリデーションエラーをまとめて返す

## ベースコード

```go
package main

import (
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"net/http"
	"regexp"
)

// ユーザー登録リクエスト
type UserRegistration struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Age      int    `json:"age" validate:"gte=0,lte=130"`
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required,min=8"`
}

// カスタムバリデーター
type CustomValidator struct {
	validator *validator.Validate
}

// Validate メソッド
func (cv *CustomValidator) Validate(i interface{}) error {
	// ここにバリデーションロジックを実装してください
	return nil
}

// パスワード強度チェック
func isStrongPassword(password string) bool {
	// ここにパスワード強度チェックを実装してください
	return false
}

// ユーザー名形式チェック
func isValidUsername(username string) bool {
	// ここにユーザー名形式チェックを実装してください
	return false
}

func main() {
	e := echo.New()

	// バリデーターの設定
	// ここにバリデーターの設定を実装してください

	// ユーザー登録API
	e.POST("/api/users/register", func(c echo.Context) error {
		// ここにユーザー登録APIを実装してください
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
	"regexp"
	"strings"
)

// ユーザー登録リクエスト
type UserRegistration struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Age      int    `json:"age" validate:"gte=0,lte=130"`
	Username string `json:"username" validate:"required,validUsername"`
	Password string `json:"password" validate:"required,min=8,strongPassword"`
}

// カスタムバリデーター
type CustomValidator struct {
	validator *validator.Validate
}

// Validate メソッド
func (cv *CustomValidator) Validate(i interface{}) error {
	return cv.validator.Struct(i)
}

// パスワード強度チェック
func isStrongPassword(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	
	// 大文字を含む
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	// 小文字を含む
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	// 数字を含む
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
	// 特殊文字を含む
	hasSpecial := regexp.MustCompile(`[!@#$%^&*(),.?":{}|<>]`).MatchString(password)
	
	return hasUpper && hasLower && hasNumber && hasSpecial
}

// ユーザー名形式チェック
func isValidUsername(fl validator.FieldLevel) bool {
	username := fl.Field().String()
	
	// 英数字とアンダースコアのみ、3〜20文字
	matched, _ := regexp.MatchString(`^[a-zA-Z0-9_]{3,20}$`, username)
	return matched
}

// バリデーションエラーのフォーマット
func formatValidationErrors(err error) map[string]interface{} {
	errors := make(map[string]interface{})
	
	if validationErrs, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrs {
			field := strings.ToLower(e.Field())
			
			switch e.Tag() {
			case "required":
				errors[field] = fmt.Sprintf("%s is required", field)
			case "email":
				errors[field] = fmt.Sprintf("%s must be a valid email address", field)
			case "gte":
				errors[field] = fmt.Sprintf("%s must be greater than or equal to %s", field, e.Param())
			case "lte":
				errors[field] = fmt.Sprintf("%s must be less than or equal to %s", field, e.Param())
			case "min":
				errors[field] = fmt.Sprintf("%s must be at least %s characters long", field, e.Param())
			case "strongPassword":
				errors[field] = "password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
			case "validUsername":
				errors[field] = "username must be 3-20 characters long and contain only letters, numbers, and underscores"
			default:
				errors[field] = fmt.Sprintf("%s failed validation: %s", field, e.Tag())
			}
		}
	}
	
	return errors
}

func main() {
	e := echo.New()

	// バリデーターの設定
	v := validator.New()
	
	// カスタムバリデーションルールの登録
	v.RegisterValidation("strongPassword", isStrongPassword)
	v.RegisterValidation("validUsername", isValidUsername)
	
	// Echoにバリデーターを設定
	e.Validator = &CustomValidator{validator: v}

	// ユーザー登録API
	e.POST("/api/users/register", func(c echo.Context) error {
		u := new(UserRegistration)
		
		// リクエストボディをバインド
		if err := c.Bind(u); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"error": "Invalid request format",
			})
		}
		
		// バリデーション
		if err := c.Validate(u); err != nil {
			return c.JSON(http.StatusUnprocessableEntity, map[string]interface{}{
				"message": "Validation failed",
				"errors":  formatValidationErrors(err),
			})
		}
		
		// バリデーション成功
		return c.JSON(http.StatusCreated, map[string]interface{}{
			"message": "User registered successfully",
			"user": map[string]interface{}{
				"name":     u.Name,
				"email":    u.Email,
				"age":      u.Age,
				"username": u.Username,
			},
		})
	})

	e.Logger.Fatal(e.Start(":8080"))
}
```
