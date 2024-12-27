<template>
    <div class="chess-piece" draggable="true" @dragstart="onDragStart" @dragend="onDragEnd">
        <img :src="pieceImage" :alt="`${name} ${teamColor}`" />
    </div>
</template>

<script>
export default {
    name: 'ChessPiece',
    props: {
        name: {
            type: String,
            required: true
        },
        teamColor: {
            type: String,
            required: true
        }
    },
    data: () => ({
        x: 0,
        y: 0
    }),
    computed: {
        pieceImage() {
            return `assets/${this.teamColor}${this.name}.png`;
        }
    },
    methods: {
        onDragStart(event) {
            this.x = event.clientX;
            this.y = event.clientY;

            event.dataTransfer.effectAllowed = 'move';
        },
        onDragEnd(event) {
            const x = event.clientX;
            const y = event.clientY;

            //the actual board is centered and is a width of 800px and height of 800px
            //so we need to calculate the position of the piece on the board

            const boardSize = 800;
            const boardOffsetX = (window.innerWidth - boardSize) / 2;
            const boardOffsetY = (window.innerHeight - boardSize) / 2;

            const relativeX = x - boardOffsetX;
            const relativeY = y - boardOffsetY;

            const originalX = this.x - boardOffsetX;
            const originalY = this.y - boardOffsetY;

            console.log(`Piece dragged to: ${x}-${y}  Original position: ${originalX}-${originalY}`);

            if (relativeX >= 0 && relativeX <= boardSize && relativeY >= 0 && relativeY <= boardSize) {
                const squareSize = boardSize / 8;
                const boardX = Math.floor(relativeX / squareSize);
                const boardY = Math.floor(relativeY / squareSize);

                const boardOriginalX = Math.floor(originalX / squareSize);
                const boardOriginalY = Math.floor(originalY / squareSize);

                console.log(`Piece dropped on cell: ${boardX}-${boardY}  Original cell: ${boardOriginalX}-${boardOriginalY}`);

                // Emit event to parent component
                this.$emit('piece-dropped', { cell: { x: boardX, y: boardY, originalX: boardOriginalX, originalY: boardOriginalY }, 
                    piece: { name: this.name, teamColor: this.teamColor } });
            } else {
                console.log('Piece dropped outside of board');
            }

        }
    }
}
</script>

<style scoped>
.chess-piece img {
    width: 100%;
    height: auto;
}
</style>