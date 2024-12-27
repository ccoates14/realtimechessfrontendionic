<template>
    <div class="chess-board">
        <div v-for="row in 8" :key="row" class="row">
            <div v-for="col in 8" :key="col" :class="['cell', getCellColor(row, col)]">
                <ChessPiece v-if="board[row - 1][col - 1] != 0" :name="piecesByNumbers[board[row - 1][col - 1]]" 
                :teamColor="getTeamColor(board[row - 1][col - 1])" class="centered-piece" @pieceDropped="handlePieceDragged"/>
            </div>
        </div>
    </div>
</template>

<script>
import ChessPiece from '@/components/ChessPiece.vue';
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
        ]
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

            console.log(this.board);
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
</style>