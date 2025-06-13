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
}

function cerrarDetalles() {
    elementoDetalles.value = new PersonajeDTO();
    mostrarDetalles.value = false;
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
    <div
        id="componenteGuia"
        class="p-2 d-flex flex-column justify-content-center align-items-center gap-2"
    >
        <h2 class="fs-1">Guia</h2>

        <p class="info">
            Aqui podrás consultar los personajes, los enemigos, mejoras y
            objetos.
        </p>

        <form
            id="filtro"
            class="p-2 border-bottom border-secondary border-1 d-flex flex-wrap justify-content-center align-items-center gap-3"
        >
            <h3 class="pe-2 border-end border-secondary">Filtro</h3>

            <div class="campo">
                <label for="nombre" class="form-label">Nombre: </label>
                <input type="text" id="nombre" class="form-control" v-model="nombre" />
            </div>

            <div class="campo">
                <label for="tipo" class="form-label">Tipo: </label>
                <select id="tipo" class="form-select" v-model="tipo">
                    <option value="" disabled>--Selección de tipo--</option>
                    <option value="personajes">Personajes</option>
                    <option value="enemigos">Enemigos</option>
                    <option value="npcs">Personajes no jugables</option>
                    <option value="mejoras">Mejoras</option>
                    <option value="objetos">Objeto</option>
                </select>
            </div>

            <div class="botones">
                <button class="btn btn-primary" @click.prevent="filtrar">
                    Buscar
                </button>
                <button  class="btn btn-light" @click.prevent="limpiarFiltros">
                    Limpiar
                </button>
            </div>
        </form>

        <div class="contenido">
            <div class="contenedorLista" v-if="mostrarLista">
                <div id="lista">
                    <TarjetaDato
                        class="elemento"
                        v-for="dato in listaPaginada"
                        :key="`tarjeta-${dato.nombre}`"
                        :dato="dato"
                        @mostrar-detalles="configurarElementoDetalles"
                    >
                    </TarjetaDato>
                </div>

                <div class="paginacion">
                    <button
                        class="paginacionBTN"
                        @click="paginaActual--"
                        :disabled="paginaActual <= 1"
                    >
                        &#9664;
                    </button>
                    <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
                    <button
                        class="paginacionBTN"
                        @click="paginaActual++"
                        :disabled="paginaActual >= totalPaginas"
                    >
                        &#9654;
                    </button>
                </div>
            </div>

            <div class="relleno" v-if="mostrarDetalles"></div>

            <div id="detalles" v-if="mostrarDetalles">
                <span id="cerrarDetallesBTN" @click="cerrarDetalles"
                    >&times;</span
                >
                <div id="informacionElemento" v-if="elementoDetalles">
                    <h3>{{ elementoDetalles.nombre }}</h3>

                    <div class="apartado">
                        <h4>Descripción</h4>
                        <p>{{ elementoDetalles.descripcion }}</p>
                    </div>

                    <div
                        class="apartado"
                        v-if="comprobarElementoEstadisticas()"
                    >
                        <h4>Estadísticas</h4>
                        <div class="listaEstadisticasPersonaje">
                            <div class="estadistica">
                                <span class="nomEst">Ataque base </span>
                                <span class="valorEst">{{
                                    elementoDetalles.ataqueBase
                                }}</span>
                            </div>

                            <div class="estadistica">
                                <span class="nomEst">Ataque por nivel </span>
                                <span class="valorEst">{{
                                    elementoDetalles.ataquePorNivel
                                }}</span>
                            </div>

                            <div class="estadistica">
                                <span class="nomEst">Defensa base </span>
                                <span class="valorEst">{{
                                    elementoDetalles.defensaBase
                                }}</span>
                            </div>

                            <div class="estadistica">
                                <span class="nomEst">Defensa por nivel </span>
                                <span class="valorEst">{{
                                    elementoDetalles.defensaPorNivel
                                }}</span>
                            </div>

                            <div class="estadistica">
                                <span class="nomEst">Ataque mágico base </span>
                                <span class="valorEst">{{
                                    elementoDetalles.ataqueMagicoBase
                                }}</span>
                            </div>

                            <div class="estadistica">
                                <span class="nomEst"
                                    >Ataque mágico por nivel
                                </span>
                                <span class="valorEst">{{
                                    elementoDetalles.ataqueMagicoPorNivel
                                }}</span>
                            </div>

                            <div class="estadistica">
                                <span class="nomEst">Precisión base:</span>
                                <span class="valorEst">{{
                                    elementoDetalles.precisionBase
                                }}</span>
                            </div>

                            <div class="estadistica">
                                <span class="nomEst">Crítico base </span>
                                <span class="valorEst">{{
                                    elementoDetalles.criticoBase
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style src="./Guia-componente.css" scoped></style>

