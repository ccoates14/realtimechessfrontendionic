<template>
    <div class="chess-piece">
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
    }),
    computed: {
        pieceImage() {
            return `assets/${this.teamColor}${this.name}.png`;
        }
    },
    methods: {

    }
}
</script>

<style scoped>
.chess-piece img {
    width: 100%;
    height: auto;
}
</style>