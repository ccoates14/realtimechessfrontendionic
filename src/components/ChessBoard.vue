<template>
    <div class="chess-board-wrapper">
        <div class="row-labels">
            <div v-for="row in 8" :key="'row-' + row" class="row-label">{{ 9 - row }}</div>
        </div>
        <div>
            <div class="chess-board">
                <div v-for="row in 8" :key="row" class="row">
                    <div v-for="col in 8" :key="col" :class="['cell', getCellColor(row, col), cellSelected.row == row && cellSelected.col == col ? 'cell-selected' : '' ]" @click="cellClicked(row, col)">
                        <ChessPiece
                            v-if="board[row - 1][col - 1] != 0"
                            :name="piecesByNumbers[board[row - 1][col - 1]]"
                            :teamColor="getTeamColor(board[row - 1][col - 1])"
                            class="centered-piece"
                        />
                    </div>
                </div>
            </div>
            <div class="col-labels">
                <div v-for="col in 8" :key="'col-' + col" class="col-label">{{ String.fromCharCode(64 + col) }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import ChessPiece from '@/components/ChessPiece.vue';
import ChessBoard from '../../chessEngine/ChessBoard.ts';
import ConnectionState from '../ConnectionState.js'

export default {
    name: 'ChessBoard',
    data: () => ({
        piecesByNumbers: {
            1: 'rook',
            2: 'knight',
            3: 'bishop',
            4: 'queen',
            5: 'king',
            6: 'pawn',
            7: 'rook',
            8: 'knight',
            9: 'bishop',
            10: 'queen',
            11: 'king',
            12: 'pawn'
        },
        board: [
            [1, 2, 3, 4, 5, 3, 2, 1],
            [6, 6, 6, 6, 6, 6, 6, 6],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [12, 12, 12, 12, 12, 12, 12, 12],
            [7, 8, 9, 10, 11, 9, 8, 7]
        ],
        cellSelected: {
            row: -1,
            col: -1
        },
        chessBoard: new ChessBoard(),
        playerId: null,
        gameId: null,
        socket: null,
        winnerColor: null,
        playerColor: null,
        otherPlayerConnected: false,
        connectionState: ConnectionState.GET_CONNECTION,
        gameDisconnected: false
    }), 
    methods: {
        getCellColor(row, col) {
            return (row + col) % 2 === 0 ? 'white-cell' : 'black-cell';
        },
        getTeamColor(n) {
            return n < 7 ? 'black' : 'white';
        },
        cellClicked(row, col) {
            //once this is clicked
            // check if there is already a cell selected
            //if so then lets move the piece
            if (this.getTeamColor(this.board[row - 1][col - 1]) !== this.playerColor || !this.otherPlayerConnected || this.gameDisconnected) {
                console.log('early return');
                this.cellSelected.row = this.cellSelected.col = -1;
                return;
            }

            if (this.cellSelected.row !== -1 && this.cellSelected.col !== -1) {
                const startPos = String.fromCharCode(this.cellSelected.col + 96) + '' + this.cellSelected.row;
                const endPos = String.fromCharCode(col + 96) + '' + row;

                if (!this.chessBoard.movePiece(startPos, endPos)) {
                    console.error('Invalid move');
                    this.cellSelected.row = -1;
                    this.cellSelected.col = -1;
                    return;
                }

                this.sendMessage(startPos + endPos);

                //move the piece
                this.board[row - 1][col - 1] = this.board[this.cellSelected.row - 1][this.cellSelected.col - 1];
                this.board[this.cellSelected.row - 1][this.cellSelected.col - 1] = 0;

                console.log('moved piece from ', startPos, ' to ', endPos);
                this.cellSelected.row = -1;
                this.cellSelected.col = -1;
            } else {
                //select the cell
                this.cellSelected.row = row;
                this.cellSelected.col = col;
                console.log('selected cell ', row, col);
            }
        },
        join() {
            if (this.connectionState !== ConnectionState.CREATE_GAME) return;

            console.log('joining game');

            //wait till socket is ready
            if (this.socket.readyState !== 1) {
                setTimeout(() => {
                    this.join();
                }, 500);
                return;
            }

            this.socket.send(JSON.stringify({
                type: 'join',
                gameId: this.gameId,
                playerId: this.playerId
            }));

            this.$emit('queueStatus', 'Game Started');
        },  
        onMessage(event) {
            // this.serverMessage = event.data;
            // we are either receiving a game move from the opponent or the game is over
            const data = JSON.parse(event.data);
            console.log(data);

            if (data.type === 'start') {
                this.otherPlayerConnected = true;
                this.$emit('queueStatus', 'Game Started');

                this.connectionState = ConnectionState.START_GAME;
            } else if (data.type === 'move') {
                const startPos = data.move.substring(0, 2);
                const endPos = data.move.substring(2, 4);

                const startCol = startPos.charCodeAt(0) - 96;
                const startRow = parseInt(startPos[1]);

                const endCol = endPos.charCodeAt(0) - 96;
                const endRow = parseInt(endPos[1]);

                this.board[endRow - 1][endCol - 1] = this.board[startRow - 1][startCol - 1];
                this.board[startRow - 1][startCol - 1] = 0;

                //upon updating the move we need to check if the game is over
                if (!this.chessBoard.movePiece(startPos, endPos)) {
                    console.error('Invalid move');
                    this.socket.close();
                } else {
                    if (this.chessBoard.isKingInCheckMate(this.chessBoard.getKing(this.playerColor))) {
                        this.$emit('queueStatus', 'Game Over! You Lost!');
                        this.sendMessage('done');
                        this.socket.close();
                    }
                }
            } else if (data.type === 'done') {
                let queueStatus = 'Game Over! ';

                if (this.chessBoard.isKingInCheckMate(this.chessBoard.getKing(this.playerColor))) {
                    queueStatus += 'You lost!';
                } else {
                    queueStatus += 'You won!';
                }

                this.$emit('queueStatus', queueStatus);
            } else if (data.type === 'disconnected') {
                this.gameDisconnected = true;
                this.$emit('queueStatus', 'Game Closed');
            }


        },
        sendMessage(move) {
            const body = JSON.stringify({
                gameId: this.gameId,
                playerId: this.playerId,
                move: move,
                type: 'move'
            });

            this.socket.send(body);
        },
        connectToQueue() {
            if (this.connectionState !== ConnectionState.QUEUE_FOR_GAME) {
                console.log('invalid state request with ', this.connectionState)
                return;
            }

            const queryParam = `?playerId=${this.playerId}`;

            axios.get(`http://localhost:3000/queue${queryParam}`).then((response) => {
                console.log(response);  
                if (response.data.status == 'wait') {
                    this.$emit('queueStatus', 'Waiting for opponent');
                    setTimeout(() => {
                        this.connectToQueue();
                    }, 500);
                } else if (response.data.status == 'success') {
                    this.$emit('queueStatus', 'Game Almost Ready');
                    this.gameId = response.data.gameId;

                    if (response.data.player1.id == this.playerId) {
                        this.playerColor = response.data.player1.color;
                    } else {
                        this.playerColor = response.data.player2.color;
                    }

                    this.socket = new WebSocket(`ws://localhost:3000/`);

                    this.socket.addEventListener('open', () => {
                        console.log('WebSocket connection opened');
                    });

                    this.socket.addEventListener('message', this.onMessage);

                    // Handle WebSocket errors
                    this.socket.addEventListener('error', (error) => {
                        console.error('WebSocket Error:', error);
                    });

                    // Handle WebSocket connection close
                    this.socket.addEventListener('close', () => {
                        this.$emit('queueStatus', 'Game Closed.....');
                        console.log('WebSocket connection closed');
                    });

                    this.connectionState = ConnectionState.CREATE_GAME;
                    this.join();
                } else {
                    this.$emit('queueStatus', 'Error');
                    console.log(response);
                }
            }).catch((error) => {
                console.log(error);
            });
        },

    },
    components: {
        ChessPiece
    },
    mounted() {
        if (this.connectionState !== ConnectionState.GET_CONNECTION) {
            console.log('invalid state request with ', this.connectionState)
            return;
        }

        // connect to the server and queue for game
        axios.put('http://localhost:3000/queue').then((response) => {
            console.log(response);
            this.playerId = response.data.playerId;
            this.$emit('queueStatus', 'Connected, adding to queue');

            this.connectionState = ConnectionState.QUEUE_FOR_GAME;

            this.connectToQueue();
        }).catch((error) => {
            console.log(error);
        });
    },
    beforeDestroy() {
        // Close the WebSocket connection before the component is destroyed
        if (this.socket) {
            this.socket.close();
        }
    },
    watch() {

    }
}
</script>

<style scoped>
.chess-board {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 800px;
    height: 800px;
    margin: auto;
    border: 2px solid black;
}

.row {
    display: flex;
    flex: 1;
}

.cell {
    width: 100px;
    height: 100px;
}

.white-cell {
    background-color: white;
}

.black-cell {
    background-color: black;
}

.centered-piece {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.chess-board-wrapper {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
}

.row-labels {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-right: 10px;
}

.queue-status {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    font-size: 18px;
    font-weight: bold;
    width: 100%;
    text-align: center;
}

.row-label {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    font-size: 18px;
    font-weight: bold;
}

.col-labels {
    display: flex;
    justify-content: center;
    margin-top: 5px;
}

.col-label {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    font-size: 18px;
    font-weight: bold;
}

.cell-selected {
    border: 2px solid red;
}

</style>