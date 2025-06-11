<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PhaserGame from './juego/PhaserGame.vue';
import LoginComponente from './componentes-info/Login-componente/Login-componente.vue';
import Header from './compartido/Header/Header.vue';
import GuiaComponente from './componentes-info/Guia-componente/Guia-componente.vue';
import InformacionComponente from "./componentes-info/Informacion-general/Informacion-general.vue";

import { cerrarSesionUsuario, comprobarUsuario } from './Servicios/UsuariosServicio';


//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();

// Variables para cambiar la pantalla del juego
const fullscreen = ref(false);
const mostrarModal = ref(false);

// Variables para almacenar el login
let nombreUsuarioLogeado = ref("");

// Componente seleccionado
const componenteSeleccionado = ref('InformacionComponente');
// Lista de componentes
const componentesDisponibles: Record<string, any> = {
    'GuiaComponente': GuiaComponente,
    'InformacionComponente': InformacionComponente
};


// Alterna entre pantalla completa y partida
async function alternarPantalla() {
    fullscreen.value = !fullscreen.value;

}

// Recibe el usuario logueado
function actualizarUsuarioLoggeado(nombreUsuario: string) {
    nombreUsuarioLogeado.value = nombreUsuario;
}

async function cerrarSesion() {
    await cerrarSesionUsuario();
    location.reload();
    nombreUsuarioLogeado.value = "";
}

function cambiarComponente(componente: string) {
    componenteSeleccionado.value = componente;
}

onMounted(async () => {
    let hayUsuario: string = await comprobarUsuario();
    nombreUsuarioLogeado.value = hayUsuario;
});

</script>

<template>

    <div id="main">
        <Header :login="nombreUsuarioLogeado" @cerrar-sesion="cerrarSesion"
            @iniciar-sesion="mostrarModal = !mostrarModal"></Header>

        <div class="app-container">

            <div class="game-container" :class="{ 'fullscreen': fullscreen }" v-if="nombreUsuarioLogeado !== ''">
                <PhaserGame ref="phaserRef" />

                <button id="alternarPantalla" @click="alternarPantalla" class="fondoOscuro">

                    <span class="material-symbols-outlined">
                        fullscreen
                    </span>

                </button>
            </div>

            <div class="sinSesion-container" v-else>
                <span>Inicia sesión o registrate para jugar</span>
            </div>

            <div class="funcionlidades" v-show="!fullscreen">
                <LoginComponente v-if="mostrarModal" :visible="mostrarModal" @close="mostrarModal = false"
                    @usuario-logeado="actualizarUsuarioLoggeado" />

                <div class="seleccion">
                    <div class="botones-seleccion">
                        <button @click="cambiarComponente('InformacionComponente')">Información</button>
                        <button @click="cambiarComponente('GuiaComponente')">Guía</button>
                    </div>

                    <keep-alive>
                        <component :is="componentesDisponibles[componenteSeleccionado]" />
                    </keep-alive>
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

.sinSesion-container {
    font-size: larger;

    width: 50%;
    height: 100%;

    background-color: #000;

    display: flex;
    justify-content: center;
    align-items: center;
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

.botones-seleccion {
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.botones-seleccion button {
    padding: 8px 16px;
    background-color: #333;
    color: #fff;
    font-family: "Pixelify Sans", sans-serif;
    font-size: 1.5em;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.botones-seleccion button:hover {
    background-color: #555;
}
</style>