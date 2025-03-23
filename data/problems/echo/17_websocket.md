---
title: "WebSocket"
description: "Echoフレームワークでのウェブソケット機能の実装"
difficulty: "Hard"
category: "realtime"
relatedResources:
  - title: "Flaskドキュメント - ルーティング"
    url: "https://flask.palletsprojects.com/en/2.0.x/quickstart/#routing"
    # description: "Flask公式ドキュメントのルーティング解説"
    type: "documentation"
  - title: "Flask GitHub"
    url: "https://github.com/pallets/flask"
    description: "Flask公式GitHubリポジトリ"
    type: "github"
  - title: "Pythonフレームワーク入門"
    url: "https://zenn.dev/topics/python"
    description: "Zennに投稿されたPython関連の記事一覧"
  - title: "perplexity"
    url: "https://www.perplexity.ai/"
    description: "うおw"
---

# WebSocket実装

## 問題

Echoフレームワークを使用して、以下の要件を満たすWebSocketサーバーを実装してください：

1. 基本的なWebSocket接続：
   - `/ws` エンドポイントでWebSocket接続を確立する
   - クライアントからのメッセージを受信し、そのまま返信する（エコーサーバー）

2. ブロードキャスト機能：
   - 接続しているすべてのクライアントにメッセージをブロードキャストする機能を実装する
   - クライアントが送信したメッセージを他のすべてのクライアントに配信する

3. ルーム機能：
   - クライアントがルームに参加できる機能を実装する
   - ルーム内のクライアントにのみメッセージを配信する

4. 接続管理：
   - クライアントの接続/切断イベントを処理する
   - 接続クライアント数の追跡と管理を行う

## ベースコード

```go
package main

import (
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
	"sync"
)

// WebSocketアップグレーダー
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // すべてのオリジンを許可（本番環境では適切に制限すること）
	},
}

// クライアント構造体
type Client struct {
	// ここにクライアント構造体を定義してください
}

// ルーム構造体
type Room struct {
	// ここにルーム構造体を定義してください
}

// WebSocketハブ
type Hub struct {
	// ここにWebSocketハブを定義してください
}

// 新しいハブを作成
func newHub() *Hub {
	// ここに新しいハブを作成する関数を実装してください
	return nil
}

// ハブの実行
func (h *Hub) run() {
	// ここにハブの実行ロジックを実装してください
}

func main() {
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// WebSocketハブの作成と実行
	hub := newHub()
	go hub.run()

	// WebSocketエンドポイント
	e.GET("/ws", func(c echo.Context) error {
		// ここにWebSocket接続ハンドラを実装してください
		return nil
	})

	// テスト用のHTMLページ
	e.GET("/", func(c echo.Context) error {
		return c.HTML(http.StatusOK, `
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Demo</title>
</head>
<body>
    <h1>WebSocket Demo</h1>
    <div id="status">Disconnected</div>
    <button onclick="connect()">Connect</button>
    <button onclick="disconnect()">Disconnect</button>
    <br><br>
    <input type="text" id="message" placeholder="Enter message">
    <button onclick="sendMessage()">Send</button>
    <div id="messages"></div>
    
    <script>
        let socket;
        
        function connect() {
            // ここにWebSocket接続コードを実装してください
        }
        
        function disconnect() {
            // ここにWebSocket切断コードを実装してください
        }
        
        function sendMessage() {
            // ここにメッセージ送信コードを実装してください
        }
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
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"log"
	"net/http"
	"sync"
	"time"
)

// WebSocketアップグレーダー
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // すべてのオリジンを許可（本番環境では適切に制限すること）
	},
}

// メッセージ構造体
type Message struct {
	Type      string `json:"type"`
	Content   string `json:"content"`
	Sender    string `json:"sender"`
	Room      string `json:"room,omitempty"`
	Timestamp int64  `json:"timestamp"`
}

// クライアント構造体
type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	id       string
	username string
	rooms    map[string]bool
	mu       sync.Mutex
}

// ルーム構造体
type Room struct {
	name     string
	clients  map[*Client]bool
	messages []Message
	mu       sync.Mutex
}

// WebSocketハブ
type Hub struct {
	clients    map[*Client]bool
	rooms      map[string]*Room
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.Mutex
}

// 新しいハブを作成
func newHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		rooms:      make(map[string]*Room),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// ルームの取得（存在しない場合は作成）
func (h *Hub) getRoom(name string) *Room {
	h.mu.Lock()
	defer h.mu.Unlock()
	
	if room, ok := h.rooms[name]; ok {
		return room
	}
	
	room := &Room{
		name:     name,
		clients:  make(map[*Client]bool),
		messages: []Message{},
	}
	h.rooms[name] = room
	
	return room
}

// クライアントをルームに追加
func (c *Client) joinRoom(roomName string) {
	room := c.hub.getRoom(roomName)
	
	room.mu.Lock()
	room.clients[c] = true
	room.mu.Unlock()
	
	c.mu.Lock()
	c.rooms[roomName] = true
	c.mu.Unlock()
	
	// 参加メッセージをルームに送信
	msg := Message{
		Type:      "system",
		Content:   fmt.Sprintf("%s joined the room", c.username),
		Sender:    "System",
		Room:      roomName,
		Timestamp: time.Now().Unix(),
	}
	
	msgBytes, _ := json.Marshal(msg)
	c.hub.broadcastToRoom(roomName, msgBytes)
}

// クライアントをルームから削除
func (c *Client) leaveRoom(roomName string) {
	room := c.hub.getRoom(roomName)
	
	room.mu.Lock()
	delete(room.clients, c)
	room.mu.Unlock()
	
	c.mu.Lock()
	delete(c.rooms, roomName)
	c.mu.Unlock()
	
	// 退出メッセージをルームに送信
	msg := Message{
		Type:      "system",
		Content:   fmt.Sprintf("%s left the room", c.username),
		Sender:    "System",
		Room:      roomName,
		Timestamp: time.Now().Unix(),
	}
	
	msgBytes, _ := json.Marshal(msg)
	c.hub.broadcastToRoom(roomName, msgBytes)
}

// ルームにメッセージをブロードキャスト
func (h *Hub) broadcastToRoom(roomName string, message []byte) {
	room := h.getRoom(roomName)
	
	room.mu.Lock()
	defer room.mu.Unlock()
	
	for client := range room.clients {
		select {
		case client.send <- message:
		default:
			close(client.send)
			delete(room.clients, client)
			h.mu.Lock()
			delete(h.clients, client)
			h.mu.Unlock()
		}
	}
}

// ハブの実行
func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			
			// 接続メッセージを送信
			msg := Message{
				Type:      "system",
				Content:   fmt.Sprintf("%s connected", client.username),
				Sender:    "System",
				Timestamp: time.Now().Unix(),
			}
			
			msgBytes, _ := json.Marshal(msg)
			h.broadcast <- msgBytes
			
			// 接続数の更新メッセージを送信
			h.sendClientCount()
			
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				h.mu.Lock()
				delete(h.clients, client)
				h.mu.Unlock()
				
				// クライアントが参加していたすべてのルームから削除
				for roomName := range client.rooms {
					client.leaveRoom(roomName)
				}
				
				close(client.send)
				
				// 切断メッセージを送信
				msg := Message{
					Type:      "system",
					Content:   fmt.Sprintf("%s disconnected", client.username),
					Sender:    "System",
					Timestamp: time.Now().Unix(),
				}
				
				msgBytes, _ := json.Marshal(msg)
				h.broadcast <- msgBytes
				
				// 接続数の更新メッセージを送信
				h.sendClientCount()
			}
			
		case message := <-h.broadcast:
			h.mu.Lock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.Unlock()
		}
	}
}

// 接続クライアント数の送信
func (h *Hub) sendClientCount() {
	h.mu.Lock()
	count := len(h.clients)
	h.mu.Unlock()
	
	msg := Message{
		Type:      "client_count",
		Content:   fmt.Sprintf("%d", count),
		Sender:    "System",
		Timestamp: time.Now().Unix(),
	}
	
	msgBytes, _ := json.Marshal(msg)
	h.broadcast <- msgBytes
}

// クライアントの読み取りポンプ
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	
	c.conn.SetReadLimit(512 * 1024) // 512KB
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})
	
	for {
		_, data, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		
		// メッセージの処理
		var msg Message
		if err := json.Unmarshal(data, &msg); err != nil {
			log.Printf("error unmarshaling message: %v", err)
			continue
		}
		
		msg.Sender = c.username
		msg.Timestamp = time.Now().Unix()
		
		// メッセージタイプに基づいて処理
		switch msg.Type {
		case "chat":
			if msg.Room != "" {
				// ルームメッセージ
				msgBytes, _ := json.Marshal(msg)
				c.hub.broadcastToRoom(msg.Room, msgBytes)
			} else {
				// グローバルメッセージ
				msgBytes, _ := json.Marshal(msg)
				c.hub.broadcast <- msgBytes
			}
			
		case "join_room":
			c.joinRoom(msg.Room)
			
		case "leave_room":
			c.leaveRoom(msg.Room)
			
		default:
			// エコーバック（デフォルト動作）
			c.send <- data
		}
	}
}

// クライアントの書き込みポンプ
func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				// ハブがチャネルを閉じた
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			
			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)
			
			// キューに溜まっているメッセージも送信
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}
			
			if err := w.Close(); err != nil {
				return
			}
			
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func main() {
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// WebSocketハブの作成と実行
	hub := newHub()
	go hub.run()

	// WebSocketエンドポイント
	e.GET("/ws", func(c echo.Context) error {
		conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
		if err != nil {
			return err
		}
		
		// クエリパラメータからユーザー名を取得
		username := c.QueryParam("username")
		if username == "" {
			username = fmt.Sprintf("User%d", time.Now().UnixNano()%1000)
		}
		
		client := &Client{
			hub:      hub,
			conn:     conn,
			send:     make(chan []byte, 256),
			id:       fmt.Sprintf("%d", time.Now().UnixNano()),
			username: username,
			rooms:    make(map[string]bool),
		}
		
		hub.register <- client
		
		// 接続成功メッセージを送信
		welcomeMsg := Message{
			Type:      "welcome",
			Content:   fmt.Sprintf("Welcome, %s!", username),
			Sender:    "System",
			Timestamp: time.Now().Unix(),
		}
		
		welcomeBytes, _ := json.Marshal(welcomeMsg)
		client.send <- welcomeBytes
		
		// ゴルーチンで読み取りと書き込みを開始
		go client.writePump()
		go client.readPump()
		
		return nil
	})

	// テスト用のHTMLページ
	e.GET("/", func(c echo.Context) error {
		return c.HTML(http.StatusOK, `
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Demo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            height: 90vh;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .status-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .status {
            padding: 5px 10px;
            border-radius: 3px;
            font-weight: bold;
        }
        .connected {
            background-color: #4CAF50;
            color: white;
        }
        .disconnected {
            background-color: #f44336;
            color: white;
        }
        .client-count {
            margin-left: 10px;
            font-size: 0.9em;
            color: #666;
        }
        .chat-container {
            display: flex;
            flex: 1;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
        }
        .room-list {
            width: 200px;
            background-color: #f5f5f5;
            padding: 10px;
            border-right: 1px solid #ddd;
            overflow-y: auto;
        }
        .room-item {
            padding: 5px 10px;
            margin-bottom: 5px;
            cursor: pointer;
            border-radius: 3px;
        }
        .room-item:hover {
            background-color: #e0e0e0;
        }
        .room-item.active {
            background-color: #4CAF50;
            color: white;
        }
        .chat-area {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        .message-list {
            flex: 1;
            padding: 10px;
            overflow-y: auto;
            background-color: white;
        }
        .message {
            margin-bottom: 10px;
            padding: 8px 12px;
            border-radius: 5px;
            max-width: 70%;
        }
        .message.system {
            background-color: #f1f1f1;
            color: #666;
            font-style: italic;
            max-width: 100%;
            text-align: center;
        }
        .message.self {
            background-color: #dcf8c6;
            align-self: flex-end;
            margin-left: auto;
        }
        .message.other {
            background-color: #f1f0f0;
            align-self: flex-start;
        }
        .message-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 0.8em;
            color: #666;
        }
        .message-sender {
            font-weight: bold;
            color: #333;
        }
        .message-content {
            word-break: break-word;
        }
        .input-area {
            display: flex;
            padding: 10px;
            background-color: #f5f5f5;
            border-top: 1px solid #ddd;
        }
        input[type="text"] {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 3px;
            margin-right: 10px;
        }
        button {
            padding: 8px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        button:hover {
            background-color: #45a049;
        }
        button.secondary {
            background-color: #2196F3;
        }
        button.secondary:hover {
            background-color: #0b7dda;
        }
        button.danger {
            background-color: #f44336;
        }
        button.danger:hover {
            background-color: #d32f2f;
        }
        .connection-form {
            margin-bottom: 15px;
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        .form-group {
            margin-bottom: 10px;
        }
        label {
            display: inline-block;
            width: 100px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>WebSocket Chat Demo</h1>
        
        <div class="connection-form" id="connection-form">
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" placeholder="Enter your username">
            </div>
            <button onclick="connect()">Connect</button>
        </div>
        
        <div class="status-bar">
            <div>
                <span id="status" class="status disconnected">Disconnected</span>
                <span id="client-count" class="client-count"></span>
            </div>
            <div>
                <button class="secondary" onclick="createRoom()">Create Room</button>
                <button class="danger" onclick="disconnect()">Disconnect</button>
            </div>
        </div>
        
        <div class="chat-container">
            <div class="room-list" id="room-list">
                <div class="room-item active" onclick="selectRoom('global')">Global Chat</div>
            </div>
            
            <div class="chat-area">
                <div class="message-list" id="message-list"></div>
                
                <div class="input-area">
                    <input type="text" id="message" placeholder="Type a message..." disabled>
                    <button onclick="sendMessage()" id="send-button" disabled>Send</button>
                </div>
 