<script setup lang="ts">
import Phaser from 'phaser';
import { nextTick, ref } from 'vue';


import PhaserGame from './juego/PhaserGame.vue';
import LoginComponente from './componentes-info/Login-componente.vue';
import Header from './compartido/Header.vue';
import { cerrarSesionUsuario } from './Servicios/UsuariosServicio';
import GuiaComponente from './componentes-info/Guia-componente.vue';


//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();

// Variables para cambiar la pantalla del juego
const fullscreen = ref(false);

// Variables para almacenar el login
let nombreUsuarioLogeado = ref("");

// Alterna entre pantalla completa y partida
async function alternarPantalla() {
    fullscreen.value = !fullscreen.value;

}

// Recibe el usuario logueado
function actualizarUsuarioLoggeado(nombreUsuario: string) {
    nombreUsuarioLogeado.value = nombreUsuario;
}

function cerrarSesion() {
    cerrarSesionUsuario();
    nombreUsuarioLogeado.value = "";
}

</script>

<template>

    <div id="main">
        <Header :login="nombreUsuarioLogeado" @cerrar-sesion="cerrarSesion"></Header>

        <div class="app-container">

            <div class="game-container" :class="{ 'fullscreen': fullscreen }">
                <PhaserGame ref="phaserRef" />

                <button id="alternarPantalla" @click="alternarPantalla" class="fondoOscuro">

                    <span class="material-symbols-outlined">
                        fullscreen
                    </span>

                </button>
            </div>

            <div class="funcionlidades" v-show="!fullscreen">
                <LoginComponente v-if="nombreUsuarioLogeado == ''" @usuario-logeado="actualizarUsuarioLoggeado" />
                <div v-else>
                    <GuiaComponente />
                </div>
            </div>

        </div>
    </div>



</template>

<style scoped>
#main {
    display: flex;
    flex-direction: column;

    height: 100vh;
    width: 100vw;
    overflow: hidden;
}

.app-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;

    min-height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;

    box-sizing: border-box;
}

.game-container {
    width: 50vw;
    height: 100vh;

    background-color: #000;

    position: relative;
    z-index: 1;
    /* transition: width 0.3s ease; */
}

.game-container.fullscreen {
    width: 100vw;
    height: 100vh;
    z-index: 100;
}

.funcionlidades {
    width: 50vw;
    height: 100vh;
    background-color: #ffffff;
    color: #000;
    z-index: 10;
}

.material-symbols-outlined {
    font-size: 3.5em;
    color: #fff;
}

#alternarPantalla {
    cursor: pointer;

    background-color: transparent;
    border: none;

    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 100;
    padding: 0.5rem;
}

#alternarPantalla:hover {
    transform: scale(1.1);
}
</style>