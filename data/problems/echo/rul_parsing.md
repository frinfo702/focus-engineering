---
title: "URL解析と操作"
description: "net/urlパッケージを使用したURLの解析と操作"
difficulty: "Easy"
category: "標準ライブラリ"
subcategory: "net/url"
---

# URL解析と操作

## 問題

net/urlパッケージを使用して、以下のURL関連の関数を実装してください：

1. `ParseURL`: 文字列からURLを解析し、スキーム、ホスト、パス、クエリパラメータを抽出する関数
2. `BuildURL`: ベースURLとパスパラメータ、クエリパラメータからURLを構築する関数
3. `ExtractQueryParams`: URLからクエリパラメータを抽出し、マップとして返す関数

## ベースコード

```go
package urlops

import (
	// 必要なパッケージをインポートしてください
)

// URLComponents はURLの構成要素を表す構造体です
type URLComponents struct {
	Scheme   string
	Host     string
	Path     string
	Query    map[string]string
}

// ParseURL は文字列からURLを解析し、構成要素を抽出します
func ParseURL(rawURL string) (URLComponents, error) {
	// ここに実装を書いてください
}

// BuildURL はベースURLとパスパラメータ、クエリパラメータからURLを構築します
func BuildURL(baseURL, path string, queryParams map[string]string) (string, error) {
	// ここに実装を書いてください
}

// ExtractQueryParams はURLからクエリパラメータを抽出します
func ExtractQueryParams(rawURL string) (map[string]string, error) {
	// ここに実装を書いてください
}
```

## 解答例

```go
package urlops

import (
	"net/url"
)

// URLComponents はURLの構成要素を表す構造体です
type URLComponents struct {
	Scheme   string
	Host     string
	Path     string
	Query    map[string]string
}

// ParseURL は文字列からURLを解析し、構成要素を抽出します
func ParseURL(rawURL string) (URLComponents, error) {
	// URLを解析
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return URLComponents{}, err
	}
	
	// クエリパラメータをマップに変換
	queryMap := make(map[string]string)
	for k, v := range parsedURL.Query() {
		if len(v) > 0 {
			queryMap[k] = v[0]
		}
	}
	
	// 結果を返す
	return URLComponents{
		Scheme: parsedURL.Scheme,
		Host:   parsedURL.Host,
		Path:   parsedURL.Path,
		Query:  queryMap,
	}, nil
}

// BuildURL はベースURLとパスパラメータ、クエリパラメータからURLを構築します
func BuildURL(baseURL, path string, queryParams map[string]string) (string, error) {
	// ベースURLを解析
	base, err := url.Parse(baseURL)
	if err != nil {
		return "", err
	}
	
	// 相対パスを解決
	base.Path = path
	
	// クエリパラメータを設定
	values := url.Values{}
	for k, v := range queryParams {
		values.Add(k, v)
	}
	base.RawQuery = values.Encode()
	
	return base.String(), nil
}

// ExtractQueryParams はURLからクエリパラメータを抽出します
func ExtractQueryParams(rawURL string) (map[string]string, error) {
	// URLを解析
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return nil, err
	}
	
	// クエリパラメータをマップに変換
	queryMap := make(map[string]string)
	for k, v := range parsedURL.Query() {
		if len(v) > 0 {
			queryMap[k] = v[0]
		}
	}
	
	return queryMap, nil
}
```
