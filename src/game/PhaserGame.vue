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
/* .game-wrapper {
    display: flex;
    width: 100vw;    
    height: 100vh;   
} */

/* .game-container {
    width: 50vw;     
    height: 100vh;   
    background-color: #000; 
    position: relative; 
    z-index: 1;       
} */

.vue-components {
    width: 50vw;      /* La otra mitad del ancho para los componentes Vue */
    height: 100vh;    /* La misma altura para los componentes */
    background-color: #f0f0f0;  /* Fondo opcional para los componentes */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    z-index: 2;        /* Asegurarse de que los componentes Vue estén encima */
}

</style>

<template>
    <div class="game-wrapper">
        <div id="game-container" ></div>
    </div>
</template>