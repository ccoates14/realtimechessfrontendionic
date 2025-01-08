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
        localhost: {
            type: Boolean,
            required: false
        }
    },
    data: () => ({
    }),
    computed: {
        pieceImage() {
            if (this.localhost) return `images/${this.teamColor}${this.name}.png`;

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