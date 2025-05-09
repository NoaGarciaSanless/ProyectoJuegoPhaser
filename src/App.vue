<script setup lang="ts">
import Phaser from 'phaser';
import { nextTick, ref } from 'vue';


import PhaserGame from './juego/PhaserGame.vue';
import LoginComponente from './componentes-info/Login-componente/Login-componente.vue';
import Header from './compartido/Header/Header.vue';
import { cerrarSesionUsuario } from './Servicios/UsuariosServicio';
import GuiaComponente from './componentes-info/Guia-componente/Guia-componente.vue';


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
    location.reload();
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
                <div class="seleccion" v-else>
                    <GuiaComponente />
                </div>
            </div>

        </div>
    </div>



</template>

<style scoped>
/* App.vue */
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap');

#main {
    display: flex;
    flex-direction: column;

    height: 100vh;
    width: 100%;

    box-sizing: border-box;

}

.app-container {
    display: flex;
    flex-direction: row;

    flex: 1;
    width: 100%;

    box-sizing: border-box;

    overflow: hidden;
}

.game-container {
    width: 50%;
    height: 100%;

    background-color: #000;

    position: relative;

    transition: width 0.3s ease, height 0.3s ease;
}

.game-container.fullscreen {
    width: 100%;
    height: 100%;
    z-index: 1000;
}

.funcionlidades {
    width: 50%;
    height: 100%;

    background-color: #f5f5f5;
    color: #333;

    overflow-y: auto;

    padding: 20px;

    box-sizing: border-box;
}

.material-symbols-outlined {
    font-size: 2.5rem;
    color: #fff;
}

#alternarPantalla {
    cursor: pointer;

    background-color: rgba(0, 0, 0, 0.5);

    border: none;
    border-radius: 8px;

    position: absolute;
    top: 1rem;
    right: 1rem;

    z-index: 1000;

    padding: 0.5rem;

    transition: transform 0.2s ease, background-color 0.2s ease;
}

#alternarPantalla:hover {
    transform: scale(1.1);
    background-color: rgba(0, 0, 0, 0.7);
}
</style>