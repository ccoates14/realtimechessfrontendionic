<template>
    <div class="chess-board-wrapper">
        <div class="row-labels">
            <div 
                v-for="row in BOARD_SIZE" 
                :key="'row-' + row" 
                class="row-label">
                {{ (BOARD_SIZE + 1) - getDisplayRow(row) }}
            </div>
        </div>
        <div>
            <div class="chess-board">
                <div 
                    v-for="row in BOARD_SIZE" 
                    :key="row" 
                    class="row">
                    <div 
                        v-for="col in BOARD_SIZE" 
                        :key="col" 
                        :class="[
                            'cell', 
                            getCellColor(getDisplayRow(row), col), 
                            cellSelected.row == getDisplayRow(row) && cellSelected.col == col ? 'cell-selected' : ''
                        ]" 
                        @click="cellClicked(getDisplayRow(row), col)">
                        <ChessPiece
                            v-if="chessBoard.getPiece(getCellDisplayPosition(getDisplayRow(row), col)) !== null"
                            :name="chessBoard.getPiece(getCellDisplayPosition(getDisplayRow(row), col)).name.toLowerCase()"
                            :teamColor="chessBoard.getPiece(getCellDisplayPosition(getDisplayRow(row), col)).color.toLowerCase()"
                            class="centered-piece"
                        />
                        <TimeTracker :duration="chessBoard.getPiece(getCellDisplayPosition(getDisplayRow(row), col)).timeout" 
                            v-if="chessBoard.getPiece(getCellDisplayPosition(getDisplayRow(row), col)) !== null &&
                                pieceLocked(chessBoard.getPiece(getCellDisplayPosition(getDisplayRow(row), col)))
                            "></TimeTracker>
                    </div>
                </div>
            </div>
            <div class="col-labels">
                <div 
                    v-for="col in BOARD_SIZE" 
                    :key="'col-' + col" 
                    class="col-label">
                    {{ getColLetter(col) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import ChessPiece from '@/components/ChessPiece.vue';
import ChessBoard from '../../chessEngine/ChessBoard.ts';
import ConnectionState from '../ConnectionState.js'
import TimeTracker from './TimeTracker.vue';

export default {
    name: 'ChessBoard',
    data: () => ({
        chessBoard: new ChessBoard(),
        playerId: null,
        gameId: null,
        socket: null,
        winnerColor: null,
        playerColor: null,
        otherPlayerConnected: false,
        connectionState: ConnectionState.GET_CONNECTION,
        gameDisconnected: false,
        cellSelected: {
            row: -1,
            col: -1
        },
        BOARD_SIZE: ChessBoard.BOARD_SIZE,
        winners: null,
        piecesLocked: []
    }), 
    computed: {
        isBlackTeam() {
            return this.playerColor === 'black';
        },
    },
    methods: {
        afterPieceUnlock(piece, customTimeout=null) {
            setTimeout(() => {
                this.piecesLocked.splice(this.piecesLocked.indexOf(piece), 1);
            }, customTimeout == null ? piece.timeout * 1000 : customTimeout);
        },
        pieceLocked(piece) {
            return this.piecesLocked.includes(piece);
        },
        getDisplayRow(row) {
            return !this.isBlackTeam ? this.BOARD_SIZE + 1 - row : row;
        },
        getCellDisplayPosition(row, col) {
            return this.getMoveString(row, col);
        },
        getColLetter(col) {
            return String.fromCharCode(73 - col).toLowerCase()
        },
        getMoveString(row, col) {
            return this.getColLetter(col) + row.toString();
        },
        getCellColor(row, col) {
            return (row + col) % 2 === 0 ? 'white-cell' : 'black-cell';
        },
        convertColToLetter(col) {
            return 105 - col;
        },
        movePiece(row, col, endRow, endCol) {
            let moved = false;

            try {
                const moveStart = this.getMoveString(row, col);
                const moveEnd = this.getMoveString(endRow, endCol);

                if (this.chessBoard.movePiece(moveStart, moveEnd)) {
                    moved = true;

                    //ya this isn't standard but it will allow the fe to focus on displaying pieces and 
                    // user input while the chess engine handles all things chess rules
                    this.$forceUpdate();
                }
            } catch (err) {
                console.warn(err);
                console.warn('the args were ');
                console.warn('row', row)
                console.warn('col', col)
                console.warn('endRow', endRow)
                console.warn('endCol', endCol)
            }

            return moved;
        },
        cellClicked(row, col) {
            if (!this.otherPlayerConnected || this.gameDisconnected) {
                this.cellSelected.row = this.cellSelected.col = -1;
                return;
            }

            const fromRow = this.cellSelected.row;
            const fromCol = this.cellSelected.col;
            const toRow = row;
            const toCol = col;

            if (this.cellSelected.row !== -1 && this.cellSelected.col !== -1) {
                const fromPiece =  this.chessBoard.getPiece(this.getMoveString(fromRow, fromCol));
                this.piecesLocked.push(fromPiece);

                if (!this.movePiece(fromRow, fromCol, toRow, toCol)) {
                    console.error('Invalid move');
                    this.cellSelected.row = -1;
                    this.cellSelected.col = -1;
                    this.afterPieceUnlock(fromPiece, 0);

                    return;
                }
                
                this.sendMessage(this.getMoveString(fromRow, fromCol) + this.getMoveString(toRow, toCol), 'move');

                this.cellSelected.row = -1;
                this.cellSelected.col = -1;

                this.afterPieceUnlock(fromPiece);
            } else {
                const piece = this.chessBoard.getPiece(this.getMoveString(toRow, toCol));

                if (piece !== null &&
                    piece.color === this.playerColor &&
                    !this.pieceLocked(piece)
                ) {
                    //select the cell
                    this.cellSelected.row = toRow;
                    this.cellSelected.col = toCol;
                }
            }
        },
        join() {
            if (this.connectionState !== ConnectionState.CREATE_GAME) return;

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
            const data = JSON.parse(event.data);
            console.log(data);

            if (this.winners) {
                return ;
            }

            if (data.type === 'start') {
                this.otherPlayerConnected = true;
                this.$emit('queueStatus', 'Game Started');

                this.connectionState = ConnectionState.START_GAME;
            } else if (data.type === 'move') {
                const startPos = data.move.substring(0, 2);
                const endPos = data.move.substring(2, 4);

                const startCol = this.convertColToLetter(startPos.charCodeAt(0));
                const startRow = parseInt(startPos[1]);

                const endCol = this.convertColToLetter(endPos.charCodeAt(0));
                const endRow = parseInt(endPos[1]);

                if (!this.movePiece(startRow, startCol, endRow, endCol)) {
                    console.error('Invalid move');
                    this.gameDisconnected = true;
                    this.$emit('queueStatus', 'Game Closed');
                    this.socket.close();
                } else {
                    const winners = this.chessBoard.getWinners();

                    if (winners.length > 0) {
                        console.log('game over getting winners')
                        this.winners = winners;
                        this.$emit('queueStatus', 'Game Over! Team ' + winners[0] + ' won!');
                        this.sendMessage('done', 'done');
                        this.socket.close();    
                    }
                }
            } else if (data.type === 'done') {
                const winners = this.chessBoard.getWinners();
                let queueStatus = 'Game Over! ';

                if (winners.length == 0) {
                    console.warn('error occured finding winner')
                } else {
                    queueStatus += 'Winner ' + winners[0];
                }

                this.$emit('queueStatus', queueStatus);
            } else if (data.type === 'disconnected') {
                this.gameDisconnected = true;
                this.$emit('queueStatus', 'Game Closed');
                console.log('Game disconnected');
            }


        },
        sendMessage(move, type) {
            const body = JSON.stringify({
                gameId: this.gameId,
                playerId: this.playerId,
                move,
                type
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

                    this.$emit('teamColor', this.playerColor);

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

                        if (this.winners) return ;

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
        ChessPiece, 
        TimeTracker
    },
    beforeMount() {
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