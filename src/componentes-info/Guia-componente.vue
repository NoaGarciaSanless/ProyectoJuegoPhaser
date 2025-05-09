<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import TarjetaDato from "../compartido/TarjetaDato.vue";
import {
    filtrarLista,
    recogerEnemigos,
    recogerPersonajes,
} from "../Servicios/DatosAssetsServicio";
import { PersonajeDTO } from "../DTOs/PersonajeDTO";
import { EnemigoDTO } from "../DTOs/EnemigoDTO";
import { MejoraDTO } from "../DTOs/MejoraDTO";
import { ObjetoDTO } from "../DTOs/ObjetoDTO";

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
    <div id="componenteGuia">
        <h2>Guia</h2>

        <p class="info">
            Aqui podrás consultar los personajes, los enemigos, mejoras y
            objetos.
        </p>

        <form id="filtro">
            <h3>Filtro</h3>

            <div class="campo">
                <label for="nombre">Nombre: </label>
                <input type="text" id="nombre" v-model="nombre" />
            </div>

            <div class="campo">
                <label for="tipo">Tipo: </label>
                <select id="tipo" v-model="tipo">
                    <option value="" disabled>--Selección de tipo--</option>
                    <option value="personajes">Personajes</option>
                    <option value="enemigos">Enemigos</option>
                    <option value="npcs">Personajes no jugables</option>
                    <option value="mejoras">Mejoras</option>
                    <option value="objetos">Objeto</option>
                </select>
            </div>

            <div class="botones">
                <button id="buscarFGBTN" @click.prevent="filtrar">
                    Buscar
                </button>
                <button id="limpiarFGBTN" @click.prevent="limpiarFiltros">
                    Limpiar
                </button>
            </div>
        </form>

        <div class="contenido">
            <div class="contenedorLista" v-if="mostrarLista">
                <div id="lista">
                    <TarjetaDato
                        class="elemento"
                        v-for="(dato, index) in listaPaginada"
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
                        :disabled="paginaActual === 1"
                    >
                        &#9664;
                    </button>
                    <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
                    <button
                        class="paginacionBTN"
                        @click="paginaActual++"
                        :disabled="paginaActual === totalPaginas"
                    >
                        &#9654;
                    </button>
                </div>
            </div>

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

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Pixelify+Sans:wght@400..700&display=swap");

/* Contenedor principal */
#componenteGuia {
    font-family: "Nunito Sans", sans-serif;
    color: #333;

    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 20px;

    box-sizing: border-box;
}

#componenteGuia h2 {
    font-size: 2rem;
    color: #222;

    margin-bottom: 10px;
}

.info {
    font-size: 1rem;
    color: #555;
    text-align: center;

    margin-bottom: 20px;

    max-width: 80%;
}

/* Formulario */
#filtro {
    width: 100%;
    max-width: 800px;

    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: center;

    padding: 15px 0;
    margin-bottom: 20px;
    border-bottom: 2px solid #ccc;
}

#filtro h3 {
    font-size: 1.25rem;

    padding-right: 15px;

    border-right: 2px solid #ccc;

    margin: 0;
}

#filtro .campo {
    display: flex;
    align-items: center;
    gap: 10px;
}

#filtro label {
    font-size: 1rem;
    color: #333;
}

#filtro input,
#filtro select {
    font-size: 1rem;
    font-family: "Nunito Sans", sans-serif;

    padding: 8px;

    border: 1px solid #ccc;
    border-radius: 4px;

    transition: border-color 0.2s ease;
}

#filtro input:focus,
#filtro select:focus {
    border-color: #007bff;
    outline: none;
}

#filtro .botones {
    margin-left: auto;
    padding-left: 15px;

    /* border-left: 2px solid #ccc; */

    display: flex;
    flex-direction: row;
    gap: 5px;
}

#filtro #buscarFGBTN {
    color: #fff;
    font-size: 1rem;

    padding: 8px 16px;

    background-color: #007bff;

    border: none;
    border-radius: 4px;

    cursor: pointer;

    transition: background-color 0.2s ease;
}

#filtro #buscarFGBTN:hover {
    background-color: #0056b3;
}

#filtro #limpiarFGBTN {
    font-size: 1rem;

    padding: 8px 16px;

    border: none;
    border-radius: 4px;

    cursor: pointer;

    transition: background-color 0.2s ease;
}

#filtro #limpiarFGBTN:hover {
    background-color: #c0c0c0;
}

/* Contenido */
.contenido {
    width: 100%;
    max-width: 1200px;
    padding: 20px;

    background-color: #ffffff;
    border-radius: 8px;

    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;

    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.contenedorLista {
    flex: 1;

    margin: 10px;
}

/* Lista de elementos */
#lista {
    width: 100%;

    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    grid-auto-rows: minmax(250px, auto);
    gap: 15px;
}

.paginacion {
    font-family: "Nunito Sans", sans-serif;

    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}
.paginacion .paginacionBTN {
    font-size: 1.5em;

    border: none;
    background-color: transparent;
}

/* Estilo de cada elemento de la lista */
.elemento {
    height: 100%;
    box-sizing: border-box;

    display: flex;
    flex-direction: column;

    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.elemento:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Detalles del elemento seleccionado */
#detalles {
    position: relative;

    font-family: "MyCustomFont", sans-serif;

    height: fit-content;

    flex: 1;

    margin: 10px;
    padding: 10px;

    background-color: #9b8282;
    border-radius: 10px;
}

/* Boton para cerrar el div de info */
#cerrarDetallesBTN {
    cursor: pointer;

    font-size: 1.5rem;
    color: #fff;
    font-weight: bold;

    position: absolute;
    top: 10px;
    right: 15px;

    transition: color 0.2s ease;

    z-index: 10;
}

#cerrarDetallesBTN:hover {
    color: #ff4d4d;
}

/* Div del contenedor de detalles */
#informacionElemento {
    display: flex;
    flex-direction: column;
}

#detalles h3 {
    text-decoration: underline wavy;
    text-underline-offset: 9px;
}

/* Cada campo de la información */
.apartado {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;

    margin: 10px 0px 10px 0px;
}

.apartado h4 {
    margin: 0;
}

.apartado p {
    font-family: "Pixelify Sans", sans-serif;

    margin: 0;
    padding: 5px;
}

/* Lista de estadísticas en la información */
.listaEstadisticasPersonaje {
    font-size: 0.85em;
    color: #333;

    display: grid;
    grid-template-columns: 1fr 1fr; /* Dos columnas equilibradas */
    gap: 12px;

    padding: 10px;
}

.estadistica {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;

    background-color: #f7f7f7;

    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    padding: 10px 15px;

    transition: background-color 0.3s ease;
}

.estadistica:hover {
    background-color: #e2e2e2;
}

.nomEst {
    font-weight: 600;
    color: #444;
}

.valorEst {
    color: #007bff;
    font-weight: 700;
}

/* Media query para pantallas menores a 768px */
@media (max-width: 768px) {
    #filtro {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }

    #filtro .campo {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
    }

    #filtro input,
    #filtro select {
        width: 100%;
        box-sizing: border-box;
    }

    #filtro h3 {
        border-right: none;
        padding-right: 0;
        margin-bottom: 10px;
    }

    #filtro .botones {
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        margin-left: 0;
        border-left: none;
        padding-left: 0;
    }

    #filtro #buscarFGBTN,
    #filtro #limpiarFGBTN {
        width: 48%;
    }
    .contenido {
        flex-direction: column;
        padding: 10px;
    }

    #detalles,
    #lista {
        width: 100%;
        margin: 0;
        padding: 10px 0;
    }

    .listaEstadisticasPersonaje {
        grid-template-columns: 1fr;
    }
}

/* Media query para pantallas muy pequeñas (<480px) */
@media (max-width: 480px) {
    #filtro input,
    #filtro select {
        width: 100%;
    }

    .estadistica {
        flex-direction: column;
        align-items: flex-start;
    }

    .nomEst,
    .valorEst {
        font-size: 0.9em;
    }
}
</style>

