package websocket

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	clients map[int][]*Client // userID -> connections
	mu      sync.RWMutex
}

type NotificationMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func NewHub() *Hub {
	return &Hub{
		clients: make(map[int][]*Client),
	}
}

func (h *Hub) Register(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[client.UserID] = append(h.clients[client.UserID], client)
}

func (h *Hub) Unregister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	clients := h.clients[client.UserID]
	for i, c := range clients {
		if c == client {
			h.clients[client.UserID] = append(clients[:i], clients[i+1:]...)
			break
		}
	}
	if len(h.clients[client.UserID]) == 0 {
		delete(h.clients, client.UserID)
	}
}

func (h *Hub) SendToUser(userID int, msg NotificationMessage) {
	h.mu.RLock()
	clients := h.clients[userID]
	h.mu.RUnlock()

	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("failed to marshal notification: %v", err)
		return
	}

	for _, client := range clients {
		select {
		case client.Send <- data:
		default:
			// Client send buffer full, skip
		}
	}
}

type Client struct {
	Hub    *Hub
	Conn   *websocket.Conn
	UserID int
	Send   chan []byte
}

func NewClient(hub *Hub, conn *websocket.Conn, userID int) *Client {
	return &Client{
		Hub:    hub,
		Conn:   conn,
		UserID: userID,
		Send:   make(chan []byte, 256),
	}
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister(c)
		c.Conn.Close()
	}()

	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

func (c *Client) WritePump() {
	defer c.Conn.Close()

	for msg := range c.Send {
		if err := c.Conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
}
