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
                            @pieceDropped="handlePieceDragged"
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
import ChessPiece from '@/components/ChessPiece.vue';
import ChessBoard from '../../chessEngine/ChessBoard.ts';

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
        chessBoard: new ChessBoard()
    }),
    methods: {
        getCellColor(row, col) {
            return (row + col) % 2 === 0 ? 'white-cell' : 'black-cell';
        },
        getTeamColor(n) {
            return n < 7 ? 'black' : 'white';
        },
        handlePieceDragged(event) {
            const { cell, piece } = event;

            console.log(`Piece dropped on cell: ${cell.x}-${cell.y}  Original cell: ${cell.originalX}-${cell.originalY}`);

            this.board[cell.originalY][cell.originalX] = 0;

            this.board[cell.y][cell.x] =
                parseInt(Object.keys(this.piecesByNumbers).find(key => this.piecesByNumbers[key] === piece.name)) + (piece.teamColor === 'white' ? 6 : 0);
        },
        cellClicked(row, col) {
            //once this is clicked
            // check if there is already a cell selected
            //if so then lets move the piece

            if (this.cellSelected.row !== -1 && this.cellSelected.col !== -1) {
                const startPos = String.fromCharCode(this.cellSelected.col + 96) + '' + this.cellSelected.row;
                const endPos = String.fromCharCode(col + 96) + '' + row;

                if (!this.chessBoard.movePiece(startPos, endPos)) {
                    this.cellSelected.row = -1;
                    this.cellSelected.col = -1;
                    return;
                }

                //move the piece
                this.board[row - 1][col - 1] = this.board[this.cellSelected.row - 1][this.cellSelected.col - 1];
                this.board[this.cellSelected.row - 1][this.cellSelected.col - 1] = 0;

                this.cellSelected.row = -1;
                this.cellSelected.col = -1;
            } else {
                //select the cell
                this.cellSelected.row = row;
                this.cellSelected.col = col;
            }
        }
    },
    components: {
        ChessPiece
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