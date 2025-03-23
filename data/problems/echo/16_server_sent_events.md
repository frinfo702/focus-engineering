---
title: "Server-Sent Events (SSE)"
description: "Echoフレームワークでのサーバー送信イベント（SSE）の実装"
difficulty: "Medium"
category: "realtime"
relatedResources:
  - title: "MDN - Server-Sent Events"
    url: "https://developer.mozilla.org/ja/docs/Web/API/Server-sent_events"
    description: "Server-Sent Eventsに関する詳細な解説"
    type: "documentation"
  - title: "Go言語でのSSE実装例"
    url: "https://github.com/r3labs/sse"
    description: "Go言語でのServer-Sent Eventsの実装ライブラリ"
    type: "github"
---

# Server-Sent Events (SSE)

## 問題

Echoフレームワークを使用して、以下の要件を満たすServer-Sent Events（SSE）を実装してください：

1. 基本的なSSEエンドポイント：
   - `/events` エンドポイントで、クライアントに定期的にイベントを送信する
   - 2秒ごとに現在のサーバー時間を送信する

2. 複数のイベントタイプ：
   - `/events/system` エンドポイントで、システム情報（メモリ使用量、CPU負荷など）を5秒ごとに送信する
   - イベントタイプを `system-info` として設定する

3. イベントIDとリトライ：
   - 各イベントに一意のIDを付与する
   - クライアント切断時の再接続間隔を3秒に設定する

4. カスタムイベント：
   - `/events/custom` エンドポイントで、クエリパラメータで指定されたメッセージとイベント名でイベントを送信する
   - 送信間隔もクエリパラメータで指定できるようにする

## ベースコード

```go
package main

import (
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
	"runtime"
	"strconv"
	"time"
)

func main() {
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// 基本的なSSEエンドポイント
	e.GET("/events", func(c echo.Context) error {
		// ここに基本的なSSEエンドポイントを実装してください
		return nil
	})

	// システム情報SSEエンドポイント
	e.GET("/events/system", func(c echo.Context) error {
		// ここにシステム情報SSEエンドポイントを実装してください
		return nil
	})

	// カスタムイベントSSEエンドポイント
	e.GET("/events/custom", func(c echo.Context) error {
		// ここにカスタムイベントSSEエンドポイントを実装してください
		return nil
	})

	// テスト用のHTMLページ
	e.GET("/", func(c echo.Context) error {
		return c.HTML(http.StatusOK, `
<!DOCTYPE html>
<html>
<head>
    <title>SSE Demo</title>
</head>
<body>
    <h1>Server-Sent Events Demo</h1>
    <div id="events"></div>
    
    <script>
        const eventsDiv = document.getElementById('events');
        
        // SSE接続を開始
        const eventSource = new EventSource('/events');
        
        // メッセージ受信時の処理
        eventSource.onmessage = function(event) {
            const newElement = document.createElement('div');
            newElement.textContent = 'message: ' + event.data;
            eventsDiv.appendChild(newElement);
        };
        
        // エラー発生時の処理
        eventSource.onerror = function(error) {
            console.error('EventSource error:', error);
            eventSource.close();
        };
    </script>
</body>
</html>
		`)
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
	"runtime"
	"strconv"
	"sync/atomic"
	"time"
)

// イベントカウンター（スレッドセーフ）
var eventCounter int64 = 0

// 次のイベントIDを取得
func getNextEventID() string {
	return fmt.Sprintf("%d", atomic.AddInt64(&eventCounter, 1))
}

// SSEヘッダーの設定
func setSSEHeaders(c echo.Context) {
	c.Response().Header().Set(echo.HeaderContentType, "text/event-stream")
	c.Response().Header().Set("Cache-Control", "no-cache")
	c.Response().Header().Set("Connection", "keep-alive")
	c.Response().Header().Set("X-Accel-Buffering", "no") // Nginxのバッファリングを無効化
}

// SSEメッセージの送信
func sendSSEMessage(c echo.Context, data string, eventType string, id string) error {
	if eventType != "" {
		if _, err := fmt.Fprintf(c.Response(), "event: %s\n", eventType); err != nil {
			return err
		}
	}
	
	if id != "" {
		if _, err := fmt.Fprintf(c.Response(), "id: %s\n", id); err != nil {
			return err
		}
	}
	
	if _, err := fmt.Fprintf(c.Response(), "data: %s\n\n", data); err != nil {
		return err
	}
	
	c.Response().Flush()
	return nil
}

// メモリ使用量の取得
func getMemoryUsage() uint64 {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	return m.Alloc / 1024 / 1024 // MB単位
}

func main() {
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// 基本的なSSEエンドポイント
	e.GET("/events", func(c echo.Context) error {
		// SSEヘッダーの設定
		setSSEHeaders(c)
		
		// 再接続間隔の設定（3秒）
		if _, err := fmt.Fprintf(c.Response(), "retry: 3000\n\n"); err != nil {
			return err
		}
		
		// クライアントが切断したかどうかを検出するためのチャネル
		clientGone := c.Request().Context().Done()
		
		// 2秒ごとにイベントを送信
		ticker := time.NewTicker(2 * time.Second)
		defer ticker.Stop()
		
		for {
			select {
			case <-ticker.C:
				// 現在時刻を送信
				currentTime := time.Now().Format("2006-01-02 15:04:05")
				eventID := getNextEventID()
				
				if err := sendSSEMessage(c, currentTime, "", eventID); err != nil {
					return err
				}
			case <-clientGone:
				// クライアントが切断した場合
				return nil
			}
		}
	})

	// システム情報SSEエンドポイント
	e.GET("/events/system", func(c echo.Context) error {
		// SSEヘッダーの設定
		setSSEHeaders(c)
		
		// 再接続間隔の設定（3秒）
		if _, err := fmt.Fprintf(c.Response(), "retry: 3000\n\n"); err != nil {
			return err
		}
		
		// クライアントが切断したかどうかを検出するためのチャネル
		clientGone := c.Request().Context().Done()
		
		// 5秒ごとにイベントを送信
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()
		
		for {
			select {
			case <-ticker.C:
				// システム情報を取得
				memoryUsage := getMemoryUsage()
				numGoroutines := runtime.NumGoroutine()
				numCPU := runtime.NumCPU()
				
				// JSONフォーマットでシステム情報を送信
				data := fmt.Sprintf(`{
					"timestamp": "%s",
					"memory_usage_mb": %d,
					"goroutines": %d,
					"cpu_cores": %d
				}`, time.Now().Format("2006-01-02 15:04:05"), memoryUsage, numGoroutines, numCPU)
				
				eventID := getNextEventID()
				
				if err := sendSSEMessage(c, data, "system-info", eventID); err != nil {
					return err
				}
			case <-clientGone:
				// クライアントが切断した場合
				return nil
			}
		}
	})

	// カスタムイベントSSEエンドポイント
	e.GET("/events/custom", func(c echo.Context) error {
		// クエリパラメータの取得
		message := c.QueryParam("message")
		if message == "" {
			message = "Default message"
		}
		
		eventName := c.QueryParam("event")
		if eventName == "" {
			eventName = "custom-event"
		}
		
		intervalStr := c.QueryParam("interval")
		interval := 3 // デフォルトは3秒
		if intervalStr != "" {
			if i, err := strconv.Atoi(intervalStr); err == nil && i > 0 {
				interval = i
			}
		}
		
		// SSEヘッダーの設定
		setSSEHeaders(c)
		
		// 再接続間隔の設定（3秒）
		if _, err := fmt.Fprintf(c.Response(), "retry: 3000\n\n"); err != nil {
			return err
		}
		
		// クライアントが切断したかどうかを検出するためのチャネル
		clientGone := c.Request().Context().Done()
		
		// 指定された間隔でイベントを送信
		ticker := time.NewTicker(time.Duration(interval) * time.Second)
		defer ticker.Stop()
		
		counter := 1
		
		for {
			select {
			case <-ticker.C:
				// カスタムメッセージを送信
				data := fmt.Sprintf("%s (#%d)", message, counter)
				eventID := getNextEventID()
				
				if err := sendSSEMessage(c, data, eventName, eventID); err != nil {
					return err
				}
				
				counter++
			case <-clientGone:
				// クライアントが切断した場合
				return nil
			}
		}
	})

	// テスト用のHTMLページ
	e.GET("/", func(c echo.Context) error {
		return c.HTML(http.StatusOK, `
<!DOCTYPE html>
<html>
<head>
    <title>SSE Demo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        h1, h2 {
            color: #333;
        }
        .event-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 30px;
        }
        .event-box {
            flex: 1;
            min-width: 300px;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
        }
        .event-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .event-title {
            margin: 0;
            font-size: 1.2em;
        }
        .event-controls {
            display: flex;
            gap: 10px;
        }
        .events {
            height: 300px;
            overflow-y: auto;
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 3px;
            font-family: monospace;
        }
        .event-item {
            margin-bottom: 5px;
            padding: 5px;
            border-bottom: 1px solid #ddd;
        }
        .event-timestamp {
            color: #666;
            font-size: 0.8em;
        }
        .event-data {
            margin-top: 3px;
        }
        button {
            padding: 5px 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button.disconnect {
            background-color: #f44336;
        }
        button:hover {
            opacity: 0.8;
        }
        .custom-controls {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .form-group {
            margin-bottom: 10px;
        }
        label {
            display: inline-block;
            width: 100px;
        }
        input, select {
            padding: 5px;
            width: 200px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Server-Sent Events Demo</h1>
        <p>This demo shows how to implement Server-Sent Events (SSE) in Echo framework.</p>
        
        <div class="event-container">
            <div class="event-box">
                <div class="event-header">
                    <h3 class="event-title">Basic Events</h3>
                    <div class="event-controls">
                        <button onclick="connectBasic()">Connect</button>
                        <button class="disconnect" onclick="disconnectBasic()">Disconnect</button>
                        <button onclick="clearBasic()">Clear</button>
                    </div>
                </div>
                <div id="basic-events" class="events"></div>
            </div>
            
            <div class="event-box">
                <div class="event-header">
                    <h3 class="event-title">System Events</h3>
                    <div class="event-controls">
                        <button onclick="connectSystem()">Connect</button>
                        <button class="disconnect" onclick="disconnectSystem()">Disconnect</button>
                        <button onclick="clearSystem()">Clear</button>
                    </div>
                </div>
                <div id="system-events" class="events"></div>
            </div>
        </div>
        
        <div class="custom-controls">
            <h2>Custom Events</h2>
            <div class="form-group">
                <label for="custom-message">Message:</label>
                <input type="text" id="custom-message" value="Hello, SSE!">
            </div>
            <div class="form-group">
                <label for="custom-event">Event Name:</label>
                <input type="text" id="custom-event" value="custom-event">
            </div>
            <div class="form-group">
                <label for="custom-interval">Interval (s):</label>
                <select id="custom-interval">
                    <option value="1">1 second</option>
                    <option value="2">2 seconds</option>
                    <option value="3" selected>3 seconds</option>
                    <option value="5">5 seconds</option>
                    <option value="10">10 seconds</option>
                </select>
            </div>
            <div class="event-controls">
                <button onclick="connectCustom()">Connect</button>
                <button class="disconnect" onclick="disconnectCustom()">Disconnect</button>
                <button onclick="clearCustom()">Clear</button>
            </div>
            <div id="custom-events" class="events" style="margin-top: 10px;"></div>
        </div>
    </div>
    
    <script>
        // グローバル変数
        let basicEventSource = null;
        let systemEventSource = null;
        let customEventSource = null;
        
        // 基本イベント
        function connectBasic() {
            if (basicEventSource) {
                disconnectBasic();
            }
            
            const eventsDiv = document.getElementById('basic-events');
            basicEventSource = new EventSource('/events');
            
            // メッセージ受信時の処理
            basicEventSource.onmessage = function(event) {
                addEventToContainer(eventsDiv, 'message', event.data, event.lastEventId);
            };
            
            // エラー発生時の処理
            basicEventSource.onerror = function(error) {
                console.error('Basic EventSource error:', error);
            };
            
            addEventToContainer(eventsDiv, 'connection', 'Connected to /events', '');
        }
        
        function disconnectBasic() {
            if (basicEventSource) {
                basicEventSource.close();
                basicEventSource = null;
                const eventsDiv = document.getElementById('basic-events');
                addEventToContainer(eventsDiv, 'connection', 'Disconnected', '');
            }
        }
        
        function clearBasic() {
            document.getElementById('basic-events').innerHTML = '';
        }
        
        // システムイベント
        function connectSystem() {
            if (systemEventSource) {
                disconnectSystem();
            }
            
            const eventsDiv = document.getElementById('system-events');
            systemEventSource = new EventSource('/events/system');
            
            // system-infoイベント受信時の処理
            systemEventSource.addEventListener('system-info', function(event) {
                try {
                    const data = JSON.parse(event.data);
                    const formattedData = `Timestamp: ${data.timestamp}
Memory: ${data.memory_usage_mb} MB
Goroutines: ${data.goroutines}
CPU Cores: ${data.cpu_cores}`;
                    addEventToContainer(eventsDiv, 'system-info', formattedData, event.lastEventId);
                } catch (e) {
                    addEventToContainer(eventsDiv, 'system-info', event.data, event.lastEventId);
                }
            });
            
            // エラー発生時の処理
            systemEventSource.onerror = function(error) {
                console.error('System EventSource error:', error);
            };
            
            addEventToContainer(eventsDiv, 'connection', 'Connected to /events/system', '');
        }
        
        function disconnectSystem() {
            if (systemEventSource) {
                systemEventSource.close();
                systemEventSource = null;
                const eventsDiv = document.getElementById('system-events');
                addEventToContainer(eventsDiv, 'connection', 'Disconnected', '');
            }
        }
        
        function clearSystem() {
            document.getElementById('system-events').innerHTML = '';
        }
        
        // カスタムイベント
        function connectCustom() {
            if (customEventSource) {
                disconnectCustom();
            }
            
            const message = document.getElementById('custom-message').value;
            const eventName = document.getElementById('custom-event').value;
            const interval = document.getElementById('custom-interval').value;
            
            const url = `/events/custom?message=${encodeURIComponent(message)}&event=${encodeURIComponent(eventName)}&interval=${interval}`;
            
            const eventsDiv = document.getElementById('custom-events');
            customEventSource = new EventSource(url);
            
            // カスタムイベント受信時の処理
            customEventSource.addEventListener(eventName, function(event) {
                addEventToContainer(eventsDiv, eventName, event.data, event.lastEventId);
            });
            
            // デフォルトのメッセージハンドラ（イベント名が指定されていない場合）
            customEventSource.onmessage = function(event) {
                addEventToContainer(eventsDiv, 'message', event.data, event.lastEventId);
            };
            
            // エラー発生時の処理
            customEventSource.onerror = function(error) {
                console.error('Custom EventSource error:', error);
            };
            
            addEventToContainer(eventsDiv, 'connection', 'Connected to /events/custom', '');
        }
        
        function disconnectCustom() {
            if (customEventSource) {
                customEventSource.close();
                customEventSource = null;
                const eventsDiv = document.getElementById('custom-events');
                addEventToContainer(eventsDiv, 'connection', 'Disconnected', '');
            }
        }
        
        function clearCustom() {
            document.getElementById('custom-events').innerHTML = '';
        }
    </script>
</body>
</html>
