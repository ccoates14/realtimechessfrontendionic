const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

// In-memory player queue
const playerQueue = [];
const playersInQueue = new Map();
const playersInGame = new Map();
const games = new Map();
const socketsToGame = new Map();
let queueBeingCleaned = false;

//later we can make it so it removes dead queue

// put, add players to queue and return status and new player id
app.put('/queue', (req, res) => {
    //I think this method probably is fine regardless if the queue is being cleaned
    const playerId = uuidv4();
    playerQueue.push(playerId);
    playersInQueue.set(playerId, new Date());
    res.json({ status: 'success', playerId });
});

// get, request for a player to be matched with
app.get('/queue', (req, res) => {
    const playerId = req.query.playerId;
    let wait = true

    if (!queueBeingCleaned) {
        if (playersInGame.has(playerId)) {
            const gameId = playersInGame.get(playerId);
            const game = games.get(gameId);
            const player1 = game.player1.id;
            const player2 = game.player2.id;

            wait = false
            res.json({
                status: 'success', gameId: gameId, player1: { id: player1, color: 'white' },
                player2: { id: player2, color: 'black' },
            });
        } else if (playerQueue.length >= 2) {
            if (!playersInQueue.has(playerId)) {
                res.json({ status: 'error', message: 'Invalid player ID' });
                return;
            }

            let mainPlayer = null;
            let opponent = null;

            while (mainPlayer == null || opponent == null) {
                let currentPlayer = playerQueue.shift();

                if (currentPlayer == playerId) {
                    mainPlayer = currentPlayer
                } else if (opponent == null) {
                    opponent = currentPlayer
                } else {
                    playerQueue.push(currentPlayer);
                }
            }

            const gameId = uuidv4();
            games.set(gameId, {
                player1: { id: mainPlayer, color: 'white', socket: null },
                player2: { id: opponent, color: 'black', socket: null },
            });

            playersInQueue.delete(mainPlayer);
            playersInQueue.delete(opponent);

            playersInGame.set(mainPlayer, gameId);
            playersInGame.set(opponent, gameId);

            wait = false
            res.json({
                status: 'success', gameId: gameId, player1: { id: mainPlayer, color: 'white' },
                player2: { id: opponent, color: 'black' },
            });
        }
    }

    if (wait) {
        playersInQueue.set(playerId, new Date());
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
    const socketHash = ws._socket.remoteAddress + ':' + ws._socket.remotePort;

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        // Placeholder: Add WebSocket-specific functionality here
        const body = JSON.parse(message);
        const gameId = body.gameId;
        const playerId = body.playerId;
        const move = body.move;
        const type = body.type;

        const game = games.get(gameId);

        if (body.type === 'join') {
            if (game.player1.id === playerId) {
                game.player1.socket = ws;
                socketsToGame.set(socketHash, gameId);
            } else if (game.player2.id === playerId) {
                game.player2.socket = ws;
                socketsToGame.set(socketHash, gameId);
            } else {
                console.log('Invalid player ID');
            }

            if (game.player1.socket !== null && game.player2.socket !== null) {
                game.player1.socket.send(JSON.stringify({ type: 'start', color: game.player1.color }));
                game.player2.socket.send(JSON.stringify({ type: 'start', color: game.player2.color }));
            }
        } else {
            const opponent = game.player1.id === playerId ? game.player2 : game.player1;

            try {
                if (opponent.socket === null) {
                    ws.send(JSON.stringify({ type: 'wait' }));
                } else {
                    console.log('Sending move to opponent');
                    console.log({ type, move });
                    opponent.socket.send(JSON.stringify({ type, move }));
                    ws.send(JSON.stringify({ type: 'success' }));
                }
            } catch (error) {
                console.log('Opponent not connected');
            } finally {
                if (move == 'done') {
                    games.delete(gameId);
                    playersInGame.delete(game.player1.id);
                    playersInGame.delete(game.player2.id);
                }
            }
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed.');

        const gameId = socketsToGame.get(socketHash);

        if (gameId !== undefined) {
            const game = games.get(gameId);

            if (game === undefined) {
                return;
            }

            const opponent = game.player1.socket === ws ? game.player2 : game.player1;

            if (opponent.socket !== null) {
                opponent.socket.send(JSON.stringify({ type: 'disconnected' }));
            }

            socketsToGame.delete(socketHash);
            games.delete(gameId);
            playersInGame.delete(game.player1.id);
            playersInGame.delete(game.player2.id);
        }
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`WebSocket server listening on ws://localhost:${port}`);
});

function cleanQueue() {
    if (queueBeingCleaned || playerQueue.length === 0) {
        return;
    }

    try {
        queueBeingCleaned = true;
        console.log('Cleaning queue');
        console.log(playerQueue);
        console.log(playersInQueue);
        console.log(playersInGame);
        console.log(games);

        const MAX_QUEUE_TIME_SECONDS = 5 * 60;
        //if the player has been sitting in the queue for more then the max time then boot them
        const playerQueueToDelete = [];
        const gamesToDelete = [];

        for (let i = 0; i < playerQueue.length; i++) {
            const playerId = playerQueue[i];
            const secondsInQueue = getSecondsInQueue(playerId);

            if (secondsInQueue >= MAX_QUEUE_TIME_SECONDS) {
                //remove player
                playerQueueToDelete.push(playerId);
            }
        }

        //for each game
        games.forEach((game, gameId) => {
            if (game.player1.socket === null && game.player2.socket === null) {
                gamesToDelete.push(gameId);
            }
        });

        playerQueueToDelete.forEach(playerId => {
            playerQueue.splice(playerQueue.indexOf(playerId), 1);
            playersInQueue.delete(playerId);
        });

        gamesToDelete.forEach(gameId => {
            const game = games.get(gameId);
            games.delete(gameId);
            playersInGame.delete(game.player1.id);
            playersInGame.delete(game.player2.id);
        });

        console.log('Queue cleaned');
    } catch (error) {
        console.error('Error cleaning queue:', error);
    } finally {
        queueBeingCleaned = false;
    }
}

function getSecondsInQueue(playerId) {
    return (new Date() - playersInQueue.get(playerId)) / 1000;
}


const FIVE_MINUTES = 5 * 60 * 1000;

setInterval(cleanQueue, FIVE_MINUTES);