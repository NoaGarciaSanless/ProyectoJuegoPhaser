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
    display: flex;
    width: 100vw;    /* Usamos el 100% del ancho de la pantalla */
    height: 100vh;   /* Usamos el 100% de la altura de la pantalla */
}

.game-container {
    width: 50vw;     /* 50% del ancho de la pantalla */
    height: 100vh;   /* 100% de la altura de la pantalla */
    background-color: #000; /* El color de fondo para que se vea bien el juego */
    position: relative; /* Asegurarse de que esté posicionado correctamente */
    z-index: 1;        /* El juego estará sobre los componentes Vue */
}

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
        <div id="game-container" class="game-container"></div>
        <div class="vue-components">
            <!-- Aquí van tus otros componentes de Vue -->
            <p>Componente 1</p>
            <p>Componente 2</p>
        </div>
    </div>
</template>