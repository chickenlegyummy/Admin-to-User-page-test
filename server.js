// server.js
const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');

const app = express();
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store application state
let appState = {
  status: 'Idle',
  currentVideoIndex: 0,
  command: null
};

// Store WebSocket connections
let connections = new Set();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  connections.add(ws);

  // Send current state immediately to new connection
  ws.send(JSON.stringify(appState));

  // Handle messages from clients
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'admin-play-video':
          appState.command = 'play-video';
          appState.status = 'Playing';
          broadcast(appState);
          break;
          
        case 'admin-next-video':
          appState.command = 'next-video';
          appState.status = 'Idle';
          broadcast(appState);
          break;
          
        case 'user-video-ended':
          appState.status = 'Video has ended';
          appState.command = 'video-ended';
          broadcast(appState);
          break;
          
        case 'user-video-playing':
          appState.currentVideoIndex = message.videoIndex;
          appState.command = 'video-playing';
          broadcast(appState);
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
    connections.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    connections.delete(ws);
  });
});

// Broadcast to all connected clients
const broadcast = (data) => {
  connections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(JSON.stringify(data));
      } catch (err) {
        console.error('Error broadcasting to client:', err);
        connections.delete(ws);
      }
    } else {
      connections.delete(ws);
    }
  });
};

// Keep the HTTP endpoints for backwards compatibility (optional)
app.get('/state', (req, res) => {
  res.json(appState);
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`WebSocket server running on ws://0.0.0.0:${PORT}`);
});