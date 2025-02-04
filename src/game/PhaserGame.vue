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

    if (game.value)
    {
        game.value.destroy(true);
        game.value = null;
    }

});

defineExpose({ scene, game });

</script>

<style scoped>
.game-wrapper {
    width: 100dvw;
    height: 100dvh;
}
</style>

<template>
    <div id="game-container" class="game-wrapper"></div>
</template>