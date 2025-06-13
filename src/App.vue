<script setup lang="ts">
import { onMounted, ref } from "vue";
import PhaserGame from "./juego/PhaserGame.vue";
import LoginComponente from "./componentes-info/Login-componente/Login-componente.vue";
import Header from "./compartido/Header/Header.vue";
import GuiaComponente from "./componentes-info/Guia-componente/Guia-componente.vue";
import InformacionComponente from "./componentes-info/Informacion-general/Informacion-general.vue";

import {
    cerrarSesionUsuario,
    comprobarUsuario,
} from "./Servicios/UsuariosServicio";

//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();

// Variables para cambiar la pantalla del juego
const fullscreen = ref(false);
const mostrarModal = ref(false);

// Variables para almacenar el login
let nombreUsuarioLogeado = ref("");

// Componente seleccionado
const componenteSeleccionado = ref("InformacionComponente");
// Lista de componentes
const componentesDisponibles: Record<string, any> = {
    GuiaComponente: GuiaComponente,
    InformacionComponente: InformacionComponente,
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
    <div id="main" class="d-flex flex-column vh-100 w-100">
        <Header
            :login="nombreUsuarioLogeado"
            @cerrar-sesion="cerrarSesion"
            @iniciar-sesion="mostrarModal = !mostrarModal"
        ></Header>

        <LoginComponente
            v-if="mostrarModal"
            :visible="mostrarModal"
            @close="mostrarModal = false"
            @usuario-logeado="actualizarUsuarioLoggeado"
        />

        <div class="d-flex flex-row flex-grow-1 w-100 overflow-hidden">
            <div
                v-if="nombreUsuarioLogeado != ''"
                class="position-relative bg-dark transition-all"
                :class="[
                    'h-100',
                    nombreUsuarioLogeado ? 'w-50' : 'd-none',
                    fullscreen ? 'w-100 z-3' : '',
                ]"
            >
                <PhaserGame ref="phaserRef" />

                <button
                    id="alternarPantalla"
                    @click="alternarPantalla"
                    class="btn position-absolute top-0 end-0 m-3 rounded-3"
                >
                    <span class="material-symbols-outlined text-white fs-2">
                        fullscreen
                    </span>
                </button>
            </div>

            <div
                v-else
                class="w-50 h-100 bg-dark text-white d-flex justify-content-center align-items-center fs-4"
            >
                <span>Inicia sesión o registrate para jugar</span>
            </div>

            <div
                class="w-50 h-100 bg-light text-dark overflow-auto p-4"
                v-show="!fullscreen"
            >
                <div
                    class="mb-3 d-flex flex-column justify-content-center align-items-center gap-3"
                >
                    <div class="mb-3 d-flex justify-content-center gap-3">
                        <button
                            class="btn btn-lg btn-secondary"
                            @click="cambiarComponente('InformacionComponente')"
                        >
                            Información
                        </button>
                        <button
                            class="btn btn-lg btn-secondary"
                            @click="cambiarComponente('GuiaComponente')"
                        >
                            Guía
                        </button>
                    </div>

                    <keep-alive>
                        <component
                            :is="componentesDisponibles[componenteSeleccionado]"
                        />
                    </keep-alive>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Pixelify+Sans:wght@400..700&display=swap");

#alternarPantalla {
    transition: transform 0.2s ease, background-color 0.2s ease;
}
#alternarPantalla:hover {
    transform: scale(1.1);
    background-color: rgba(0, 0, 0, 0.7);
}

.material-symbols-outlined {
    user-select: none;
}
</style>

<style>
/* General */
button {
    transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
    transform: scale(1.05);
}
</style>

