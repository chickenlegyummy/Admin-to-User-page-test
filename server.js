// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('play-video', () => {
    io.emit('play-video'); // Broadcast to all clients
  });

  socket.on('video-ended', () => {
    io.emit('video-ended'); // Broadcast to all clients
  });

  socket.on('next-video', () => {
    io.emit('next-video'); // Broadcast to all clients
  });

  socket.on('video-playing', (data) => {
    io.emit('video-playing', data); // Broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});