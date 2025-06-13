<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import TarjetaDato from "../../compartido/TarjetaDato/TarjetaDato.vue";
import {
    filtrarLista,
    recogerEnemigos,
    recogerPersonajes,
} from "../../Servicios/DatosAssetsServicio";
import { PersonajeDTO } from "../../DTOs/PersonajeDTO";
import { EnemigoDTO } from "../../DTOs/EnemigoDTO";
import { MejoraDTO } from "../../DTOs/MejoraDTO";
import { ObjetoDTO } from "../../DTOs/ObjetoDTO";

// Listas para el filtro ****
// Lista para mostrar en el filtro
let listaMostrar = ref<any[]>([]);
// Decide si mostrar la lista
let mostrarLista = ref(true);

// Elemento que se muestra en los detalles, se inicializa con un personaje vacio por defecto
let mostrarDetalles = ref(false);
let mostrarSoloElementoSeleccionado = ref(false);
let elementoDetalles = ref(new PersonajeDTO());

// Variables del filtro
let nombre = ref("");
let tipo = ref("");

// Variables paginación
const paginaActual = ref(1);
const elementosPorPagina = 6;

let listaPaginada = computed(() => {
    const inicio = (paginaActual.value - 1) * elementosPorPagina;
    const fin = inicio + elementosPorPagina;
    return listaMostrar.value.slice(inicio, fin);
});

const totalPaginas = computed(() => {
    return Math.ceil(listaMostrar.value.length / elementosPorPagina);
});

// Funciones ---------------------------------

// Funciones para manejar la bd --------------------------
// Carga todos los datos de los elementos consultables
async function cargarDatos() {
    let lista = <any[]>[];

    // Recoge los personajes para mostrarlos en la guia
    let listaPersonajes: PersonajeDTO[] = await recogerPersonajes();
    console.log(listaPersonajes);

    lista.push(...listaPersonajes);

    // Recoge los enemigos para mostrarlos en la guia
    let listaEnemigos: EnemigoDTO[] = await recogerEnemigos();
    console.log(listaEnemigos);

    lista.push(...listaEnemigos);

    listaMostrar.value = lista;
}

// Filtra por nombre y tipo
async function filtrar() {
    cerrarDetalles();

    // Oculta la lista (principalmente para que se reinicie)
    mostrarLista.value = false;

    try {
        const resultadoFiltro = await filtrarLista(nombre.value, tipo.value);

        // console.log(resultadoFiltro);

        listaMostrar.value = resultadoFiltro;
    } catch (error) {
        console.error("Error al filtrar:", error);
        listaMostrar.value = [];
    } finally {
        mostrarLista.value = true;
    }
}

// Reinicia la lista
async function limpiarFiltros() {
    cerrarDetalles();

    nombre.value = "";
    tipo.value = "";

    mostrarLista.value = false;

    await cargarDatos();

    mostrarLista.value = true;
}

// Funciones para editar la vista --------------------------

// Muestra el elemento del que se quiren ver los detalles
function configurarElementoDetalles(dato: any) {
    elementoDetalles.value = dato;
    mostrarDetalles.value = true;
    mostrarSoloElementoSeleccionado.value = true;
}

function cerrarDetalles() {
    elementoDetalles.value = new PersonajeDTO();
    mostrarDetalles.value = false;
    mostrarSoloElementoSeleccionado.value = false;
}

// Comprueba si el elemento a mostrar es una mejora/objeto o un personaje/enemigo
function comprobarElementoEstadisticas(): boolean {
    if (elementoDetalles != null) {
        if (
            elementoDetalles instanceof MejoraDTO ||
            elementoDetalles instanceof ObjetoDTO
        ) {
            return false;
        } else {
            return true;
        }
    }
    return false;
}

// Hooks de VUE ------------------------------
// Recoge las listas de todos los elementos que se pueden consultar sobre el juego
onMounted(() => {
    cargarDatos();
});
</script>

<template>
    <div id="componenteGuia" class="p-2 d-flex flex-column justify-content-center align-items-center gap-2">
        <h2 class="fs-1">Guia</h2>
        <p class="info text-center text-secondary">
            Aquí podrás consultar los personajes, los enemigos, mejoras y objetos.
        </p>

        <form id="filtro"
            class="p-2 border-bottom border-secondary border-1 d-flex flex-wrap justify-content-center align-items-center gap-3 w-100">
            <h3 class="pe-2 border-end border-secondary">Filtro</h3>

            <div class="campo d-flex align-items-center gap-2">
                <label for="nombre" class="form-label m-0">Nombre:</label>
                <input type="text" id="nombre" class="form-control" v-model="nombre" />
            </div>

            <div class="campo d-flex align-items-center gap-2">
                <label for="tipo" class="form-label m-0">Tipo:</label>
                <select id="tipo" class="form-select" v-model="tipo">
                    <option value="" disabled>--Selección de tipo--</option>
                    <option value="personajes">Personajes</option>
                    <option value="enemigos">Enemigos</option>
                    <option value="npcs">Personajes no jugables</option>
                    <option value="mejoras">Mejoras</option>
                    <option value="objetos">Objeto</option>
                </select>
            </div>

            <div class="ms-1 ps-1 d-flex gap-2">
                <button class="btn btn-primary" @click.prevent="filtrar">Buscar</button>
                <button class="btn btn-light" @click.prevent="limpiarFiltros">Limpiar</button>
            </div>
        </form>

        <div class="contenido d-flex flex-row justify-content-between w-100 p-3 bg-white rounded shadow">
            <div class="contenedorLista flex-fill m-2" v-if="mostrarLista">
                <div id="lista" class="d-grid"
                    style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">

                    <!-- SOLO muestra el seleccionado si está activo -->
                    <TarjetaDato v-if="mostrarSoloElementoSeleccionado && elementoDetalles" class="elemento"
                        :dato="elementoDetalles" @mostrar-detalles="configurarElementoDetalles" />

                    <!-- Muestra la lista paginada normal si NO está activo -->
                    <TarjetaDato v-else class="elemento" v-for="dato in listaPaginada" :key="`tarjeta-${dato.nombre}`"
                        :dato="dato" @mostrar-detalles="configurarElementoDetalles" />
                </div>

                <!-- Paginación solo si NO se muestra solo el seleccionado -->
                <div class="paginacion d-flex justify-content-around align-items-center mt-3"
                    v-if="!mostrarSoloElementoSeleccionado">
                    <button class="paginacionBTN btn btn-outline-secondary fs-4 p-0" @click="paginaActual--"
                        :disabled="paginaActual <= 1">
                        &#9664;
                    </button>
                    <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
                    <button class="paginacionBTN btn btn-outline-secondary fs-4 p-0" @click="paginaActual++"
                        :disabled="paginaActual >= totalPaginas">
                        &#9654;
                    </button>
                </div>
            </div>

            <div class="relleno flex-shrink-1" v-if="mostrarDetalles"></div>

            <div id="detalles" class="position-relative flex-grow-1 m-2 p-3 rounded" v-if="mostrarDetalles">
                <span id="cerrarDetallesBTN" @click="cerrarDetalles" class="position-absolute top-0 end-1 fs-3 fw-bold"
                    style="cursor: pointer;">&times;</span>

                <div id="informacionElemento" v-if="elementoDetalles" class="d-flex flex-column">
                    <h3>{{ elementoDetalles.nombre }}</h3>

                    <div class="apartado my-2">
                        <h4>Descripción</h4>
                        <p>{{ elementoDetalles.descripcion }}</p>
                    </div>

                    <div class="apartado my-2" v-if="comprobarElementoEstadisticas()">
                        <h4 class="mb-2">Estadísticas</h4>
                        <div class="listaEstadisticasPersonaje d-grid gap-2" style="grid-template-columns: 1fr 1fr;">
                            <div class="estadistica d-flex justify-content-between align-items-center bg-light text-dark p-2 rounded shadow-sm"
                                v-for="(valor, clave) in {
                                    'Ataque base': elementoDetalles.ataqueBase,
                                    'Ataque por nivel': elementoDetalles.ataquePorNivel,
                                    'Defensa base': elementoDetalles.defensaBase,
                                    'Defensa por nivel': elementoDetalles.defensaPorNivel,
                                    'Ataque mágico base': elementoDetalles.ataqueMagicoBase,
                                    'Ataque mágico por nivel': elementoDetalles.ataqueMagicoPorNivel,
                                    'Precisión base': elementoDetalles.precisionBase,
                                    'Crítico base': elementoDetalles.criticoBase
                                }" :key="clave">
                                <span class="fw-semibold fs-7">{{ clave }}</span>
                                <span class="text-primary fs-7 fw-bold">{{ valor }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style src="./Guia-componente.css" scoped></style>

