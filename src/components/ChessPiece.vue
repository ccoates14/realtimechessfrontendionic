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
        },
    },
    data: () => ({
    }),
    computed: {
        pieceImage() {
            //https://storage.cloud.google.com/realtimechess/assets/images/blackbishop.png
            return `https://storage.cloud.google.com/realtimechess/assets/images/${this.teamColor}${this.name}.png`;
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