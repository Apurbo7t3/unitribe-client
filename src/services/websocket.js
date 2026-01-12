// src/services/websocket.js
class WebSocketService {
  constructor() {
    this.socket = null;
    this.callbacks = new Map();
  }

  connect() {
    const token = localStorage.getItem('access_token');
    this.socket = new WebSocket(`ws://localhost:8000/ws/chat/?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };
  }

  handleMessage(data) {
    const { type, ...message } = data;
    
    if (this.callbacks.has(type)) {
      this.callbacks.get(type).forEach(callback => callback(message));
    }
  }

  on(type, callback) {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, []);
    }
    this.callbacks.get(type).push(callback);
  }

  send(type, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, ...data }));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export default new WebSocketService();

