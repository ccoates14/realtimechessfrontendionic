const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

// In-memory player queue
const playerQueue = [];
const playersInQueue = new Set();
const games = new Map();

// put, add players to queue and return status and new player id
app.put('/queue', (req, res) => {
    const playerId = uuidv4();
    playerQueue.push(playerId);
    playersInQueue.add(playerId);
    res.json({ status: 'success', playerId });
});

// get, request for a player to be matched with
app.get('/queue', (req, res) => {
    if (playerQueue.length >= 2) {
        const player1 = playerQueue.shift();
        const player2 = playerQueue.shift();
        playersInQueue.delete(player1);
        playersInQueue.delete(player2);

        const gameId = uuidv4();
        games.set(gameId, { 
            player1: { id: player1, color: 'white', socket: null },
            player2: { id: player2, color: 'black', socket: null },
        });

        res.json({ status: 'success', gameId });
    } else {
        res.json({ status: 'wait' });
    }
});

//get number of players in queue
app.get('/queue/length', (req, res) => {
    res.json({ length: playerQueue.length });
});


// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection logic
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established.');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        // Placeholder: Add WebSocket-specific functionality here
        const body = JSON.parse(message);
        const gameId = body.gameId;
        const playerId = body.playerId;
        const game = games.get(gameId);

        if (body.type === 'join') {
            if (game.player1.id === playerId) {
                game.player1.socket = ws;
            } else if (game.player2.id === playerId) {
                game.player2.socket = ws;
            } else {
                console.log('Invalid player ID');
            }
        } else {
            const opponent = game.player1.id === playerId ? game.player2 : game.player1;

            try {
                if (opponent.socket === null) {
                    ws.send(JSON.stringify({ type: 'wait' }));
                } else {
                    opponent.socket.send(JSON.stringify({ type: 'move', move }));
                    ws.send(JSON.stringify({ type: 'success' }));
                }
            } catch (error) {
                console.log('Opponent not connected');
            } finally {
                if (move == 'done') {
                    games.delete(gameId);
                }
            }
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed.');
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`WebSocket server listening on ws://localhost:${port}`);
});