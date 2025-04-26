<script setup lang="ts">
import Phaser from 'phaser';
import { ref, toRaw } from 'vue';


import PhaserGame from './juego/PhaserGame.vue';
import LoginComponente from './componentes-info/Login-componente.vue';


//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();


</script>

<template>
    <PhaserGame ref="phaserRef" class="game-container" />
    <div class="funcionlidades">
        <LoginComponente/>
    </div>

</template>

<style scoped>


.game-container {
    width: 50vw;
    /* 50% del ancho de la pantalla */
    height: 100vh;
    /* 100% de la altura de la pantalla */
    background-color: #000;
    /* El color de fondo para que se vea bien el juego */
    position: relative;
    /* Asegurarse de que esté posicionado correctamente */
    z-index: 1;
    /* El juego estará sobre los componentes Vue */
}

.funcionlidades {
    width: 50vw;
    /* La otra mitad del ancho para los componentes Vue */
    height: 100vh;
    /* La misma altura para los componentes */
    background-color: #ffffff;
    color: #000;
    /* Fondo opcional para los componentes */
    
    z-index: 10;
    /* Asegurarse de que los componentes Vue estén encima */
}
</style>