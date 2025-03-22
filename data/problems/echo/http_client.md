---
title: "HTTPクライアント"
description: "net/httpパッケージを使用したHTTPリクエストの送信"
difficulty: "Easy"
category: "標準ライブラリ"
subcategory: "net/http"
---

# HTTPクライアント

## 問題

net/httpパッケージを使用して、以下のHTTPクライアント関数を実装してください：

1. `GetRequest`: 指定されたURLにGETリクエストを送信し、レスポンスの本文を取得する関数
2. `PostJSON`: 指定されたURLにJSONデータをPOSTリクエストとして送信し、レスポンスの本文を取得する関数
3. `DownloadFile`: 指定されたURLからファイルをダウンロードし、指定されたパスに保存する関数

## ベースコード

```go
package httpclient

import (
	// 必要なパッケージをインポートしてください
)

// GetRequest は指定されたURLにGETリクエストを送信し、レスポンスの本文を取得します
func GetRequest(url string) (string, error) {
	// ここに実装を書いてください
}

// PostJSON は指定されたURLにJSONデータをPOSTリクエストとして送信し、レスポンスの本文を取得します
func PostJSON(url string, data map[string]interface{}) (string, error) {
	// ここに実装を書いてください
}

// DownloadFile は指定されたURLからファイルをダウンロードし、指定されたパスに保存します
func DownloadFile(url string, filepath string) error {
	// ここに実装を書いてください
}
```

## 解答例

```go
package httpclient

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"
)

// GetRequest は指定されたURLにGETリクエストを送信し、レスポンスの本文を取得します
func GetRequest(url string) (string, error) {
	// GETリクエストを送信
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	
	// レスポンスの本文を読み込み
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	
	return string(body), nil
}

// PostJSON は指定されたURLにJSONデータをPOSTリクエストとして送信し、レスポンスの本文を取得します
func PostJSON(url string, data map[string]interface{}) (string, error) {
	// データをJSONに変換
	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	
	// POSTリクエストを送信
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	
	// レスポンスの本文を読み込み
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	
	return string(body), nil
}

// DownloadFile は指定されたURLからファイルをダウンロードし、指定されたパスに保存します
func DownloadFile(url string, filepath string) error {
	// GETリクエストを送信
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	// ファイルを作成
	out, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer out.Close()
	
	// レスポンスの本文をファイルに書き込み
	_, err = io.Copy(out, resp.Body)
	return err
}
```
