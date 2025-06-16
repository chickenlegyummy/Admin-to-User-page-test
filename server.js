// server.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Store application state
let appState = {
  status: 'Idle',
  currentVideoIndex: 0,
  command: null
};

// Store SSE connections
let connections = [];

// SSE endpoint for real-time updates
app.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  connections.push(res);

  // Send current state immediately
  res.write(`data: ${JSON.stringify(appState)}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    connections = connections.filter(conn => conn !== res);
  });
});

// Broadcast to all connected clients
const broadcast = (data) => {
  connections.forEach(conn => {
    try {
      conn.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      // Remove dead connections
      connections = connections.filter(c => c !== conn);
    }
  });
};

// Admin endpoints
app.post('/admin/play-video', (req, res) => {
  appState.command = 'play-video';
  appState.status = 'Playing';
  broadcast(appState);
  res.json({ success: true });
});

app.post('/admin/next-video', (req, res) => {
  appState.command = 'next-video';
  appState.status = 'Idle';
  broadcast(appState);
  res.json({ success: true });
});

// User endpoints
app.post('/user/video-ended', (req, res) => {
  appState.status = 'Video has ended';
  appState.command = 'video-ended';
  broadcast(appState);
  res.json({ success: true });
});

app.post('/user/video-playing', (req, res) => {
  const { videoIndex } = req.body;
  appState.currentVideoIndex = videoIndex;
  appState.command = 'video-playing';
  broadcast(appState);
  res.json({ success: true });
});

// Get current state
app.get('/state', (req, res) => {
  res.json(appState);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});