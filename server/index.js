'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const { createGame, addPlayer, playerFlip, serializeState, removePlayer, restartGame } = require('./src/game');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  const distPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(distPath));
} else {
  app.use(cors());
}
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, isProd ? {} : {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// In-memory room store: { roomId -> game }
const rooms = new Map();

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Create a new room
  socket.on('create_room', ({ playerName }) => {
    let roomId = generateRoomId();
    while (rooms.has(roomId)) roomId = generateRoomId();

    const game = createGame(roomId);
    rooms.set(roomId, game);

    const ok = addPlayer(game, socket.id, playerName || 'Player 1');
    if (!ok) {
      socket.emit('error', { message: 'Could not create room' });
      return;
    }

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.emit('room_created', { roomId, gameState: serializeState(game) });
    console.log(`Room created: ${roomId} by ${socket.id}`);
  });

  // Join an existing room
  socket.on('join_room', ({ roomId, playerName }) => {
    const game = rooms.get(roomId);
    if (!game) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    if (game.playerOrder.length >= 2) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }
    if (game.phase !== 'waiting') {
      socket.emit('error', { message: 'Game already started' });
      return;
    }

    const ok = addPlayer(game, socket.id, playerName || 'Player 2');
    if (!ok) {
      socket.emit('error', { message: 'Could not join room' });
      return;
    }

    socket.join(roomId);
    socket.data.roomId = roomId;

    const state = serializeState(game);
    // Notify both players
    io.to(roomId).emit('game_state', { gameState: state, event: 'player_joined' });
    console.log(`Player ${socket.id} joined room ${roomId}`);
  });

  // Player ready to flip their card
  socket.on('player_ready', () => {
    const roomId = socket.data.roomId;
    const game = rooms.get(roomId);
    if (!game) return;

    // Notify the room that this player is ready (so opponent can show animation)
    io.to(roomId).emit('player_ready_ack', { playerId: socket.id });

    const result = playerFlip(game, socket.id);
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }

    if (result.waiting) {
      // Waiting for the other player, nothing more to do
      return;
    }

    if (result.type === 'game_over') {
      io.to(roomId).emit('game_over', {
        winnerId: result.winnerId,
        reason: result.reason,
        gameState: result.gameState,
      });
    } else {
      io.to(roomId).emit('game_state', {
        gameState: result.gameState,
        event: result.type === 'battle' ? 'battle' : 'round_result',
        winnerId: result.winnerId,
        card1: result.card1,
        card2: result.card2,
        cardsWon: result.cardsWon,
      });
    }
  });

  // Player votes to restart the game in the same room
  socket.on('restart_game', () => {
    const roomId = socket.data.roomId;
    const game = rooms.get(roomId);
    if (!game || game.phase !== 'over') return;

    game.restartVotes.add(socket.id);
    io.to(roomId).emit('restart_vote', { playerId: socket.id, count: game.restartVotes.size });

    if (game.restartVotes.size >= 2) {
      restartGame(game);
      io.to(roomId).emit('game_state', { gameState: serializeState(game), event: 'game_restarted' });
      console.log(`Game restarted in room ${roomId}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    const roomId = socket.data.roomId;
    if (!roomId) return;
    const game = rooms.get(roomId);
    if (!game) return;

    const result = removePlayer(game, socket.id);
    if (result) {
      io.to(roomId).emit('game_over', {
        winnerId: result.winnerId,
        reason: result.reason,
        gameState: result.gameState,
      });
    }

    // Clean up room if empty
    if (game.playerOrder.length <= 1) {
      rooms.delete(roomId);
    }
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

if (isProd) {
  const distPath = path.join(__dirname, '..', 'client', 'dist');
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || (isProd ? 3000 : 3001);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
