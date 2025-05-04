<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import StartGame from './main';

// Save the current scene instance
const scene = ref();
const game = ref();


onMounted(() => {
    game.value = StartGame('game-container');

});

onUnmounted(() => {

    if (game.value) {
        game.value.destroy(true);
        game.value = null;
    }

});

defineExpose({ scene, game });

</script>

<style scoped></style>

<template>

    <div id="game-container"></div>

</template>