---
title: "スライスのソート"
description: "sortパッケージを使用したスライスのソート"
difficulty: "Easy"
category: "標準ライブラリ"
subcategory: "sort"
---

# スライスのソート

## 問題

sortパッケージを使用して、以下のソート関数を実装してください：

1. `SortInts`: 整数のスライスを昇順にソートする関数
2. `SortStrings`: 文字列のスライスを昇順にソートする関数
3. `SortByLength`: 文字列のスライスを長さ順にソートする関数
4. `SortPersonsByAge`: Person構造体のスライスを年齢順にソートする関数

## ベースコード

```go
package sorting

import (
	// 必要なパッケージをインポートしてください
)

// Person は人物情報を表す構造体です
type Person struct {
	Name string
	Age  int
}

// SortInts は整数のスライスを昇順にソートします
func SortInts(numbers []int) {
	// ここに実装を書いてください
}

// SortStrings は文字列のスライスを昇順にソートします
func SortStrings(strings []string) {
	// ここに実装を書いてください
}

// SortByLength は文字列のスライスを長さ順にソートします
func SortByLength(strings []string) {
	// ここに実装を書いてください
}

// SortPersonsByAge はPerson構造体のスライスを年齢順にソートします
func SortPersonsByAge(people []Person) {
	// ここに実装を書いてください
}
```

## 解答例

```go
package sorting

import (
	"sort"
)

// Person は人物情報を表す構造体です
type Person struct {
	Name string
	Age  int
}

// SortInts は整数のスライスを昇順にソートします
func SortInts(numbers []int) {
	sort.Ints(numbers)
}

// SortStrings は文字列のスライスを昇順にソートします
func SortStrings(strings []string) {
	sort.Strings(strings)
}

// SortByLength は文字列のスライスを長さ順にソートします
func SortByLength(strings []string) {
	sort.Slice(strings, func(i, j int) bool {
		return len(strings[i]) < len(strings[j])
	})
}

// SortPersonsByAge はPerson構造体のスライスを年齢順にソートします
func SortPersonsByAge(people []Person) {
	sort.Slice(people, func(i, j int) bool {
		return people[i].Age < people[j].Age
	})
}
```
