---
title: "基本的な文字列フォーマット"
description: "fmtパッケージを使用した基本的な文字列フォーマット"
difficulty: "Easy"
category: "標準ライブラリ"
subcategory: "fmt"
---

# 基本的な文字列フォーマット

## 問題

以下の要件を満たす関数 `FormatUserInfo` を実装してください：

1. ユーザー情報（名前、年齢、メールアドレス）を受け取り、フォーマットされた文字列を返す
2. 出力形式: "名前: [名前], 年齢: [年齢]歳, メール: [メールアドレス]"
3. 年齢が20歳未満の場合は、"(未成年)" という文字列を年齢の後に追加する
4. メールアドレスが空の場合は、"メール: 未設定" と表示する

## ベースコード

```go
package formatting

import (
        // 必要なパッケージをインポートしてください
)

// User はユーザー情報を表す構造体です
type User struct {
        Name  string
        Age   int
        Email string
}

// FormatUserInfo は指定された形式でユーザー情報をフォーマットします
func FormatUserInfo(user User) string {
        // ここに実装を書いてください
}
```

## 解答例

```go
package formatting

import (
        "fmt"
)

// User はユーザー情報を表す構造体です
type User struct {
        Name  string
        Age   int
        Email string
}

// FormatUserInfo は指定された形式でユーザー情報をフォーマットします
func FormatUserInfo(user User) string {
        // 年齢の後ろに追加するテキストを決定
        ageText := ""
        if user.Age < 20 {
                ageText = "(未成年)"
        }
        
        // メールアドレスの表示を決定
        emailText := user.Email
        if emailText == "" {
                emailText = "未設定"
        }
        
        // フォーマットされた文字列を返す
        return fmt.Sprintf("名前: %s, 年齢: %d歳%s, メール: %s", 
                user.Name, user.Age, ageText, emailText)
}
```
