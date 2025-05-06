<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TarjetaDato from '../compartido/TarjetaDato.vue';
import { filtrarLista, recogerEnemigos, recogerPersonajes } from '../Servicios/DatosAssetsServicio';
import { PersonajeDTO } from '../DTOs/PersonajeDTO';
import { EnemigoDTO } from '../DTOs/EnemigoDTO';
import { MejoraDTO } from '../DTOs/MejoraDTO';


// Listas para el filtro
// Lista original
let lista = <any[]>[];
// Lista para mostrar en el filtro
let listaMostrar = ref<any[]>([]);
// Decide si mostrar la lista
let mostrarLista = ref(true);

// Variables del filtro
let nombre = ref("");
let tipo = ref("");

// Filtra por nombre y tipo
async function filtrar() {
    // Oculta la lista (principalmente para que se reinicie)
    mostrarLista.value = false;

    try {
        const resultadoFiltro = await filtrarLista(nombre.value, tipo.value);

        console.log(resultadoFiltro);


        listaMostrar.value = resultadoFiltro;
    } catch (error) {
        console.error("Error al filtrar:", error);
        listaMostrar.value = [];
    } finally {
        mostrarLista.value = true;

    }
}

onMounted(async () => {

    // Recoge los personajes para mostrarlos en la guia
    let listaPersonajes: PersonajeDTO[] = await recogerPersonajes();
    console.log(listaPersonajes);

    lista.push(...listaPersonajes);

    // Recoge los enemigos para mostrarlos en la guia
    let listaEnemigos: EnemigoDTO[] = await recogerEnemigos();
    console.log(listaEnemigos);

    lista.push(...listaEnemigos);

    listaMostrar.value = lista;

});

</script>

<template>
    <div id="componenteGuia">
        <h2>Guia</h2>

        <p class="info">Aqui podrás consultar los personajes, los enemigos, mejoras y objetos.</p>

        <form id="filtro">
            <h3>Filtro</h3>

            <div class="campo">
                <label for="nombre">Nombre: </label>
                <input type="text" id="nombre" v-model="nombre">
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
                <button id="buscarFGBTN" @click.prevent="filtrar">Buscar</button>
            </div>

        </form>

        <div class="contenido">
            <div id="lista" v-if="mostrarLista">
                <TarjetaDato class="elemento" v-for="(dato, index) in listaMostrar" :key="`tarjeta-${dato.nombre}`"
                    :dato="dato">
                </TarjetaDato>
            </div>

            <div class="detalles">

            </div>

        </div>
    </div>


</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap');

/* Contenedor principal */
#componenteGuia {
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 20px;

    box-sizing: border-box;

    font-family: 'Nunito Sans', sans-serif;

    color: #333;
}

#componenteGuia h2 {
    font-size: 2rem;

    margin-bottom: 10px;

    color: #222;
}

.info {
    font-size: 1rem;

    margin-bottom: 20px;

    color: #555;

    text-align: center;

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
    padding: 8px;

    border: 1px solid #ccc;
    border-radius: 4px;

    font-size: 1rem;
    font-family: 'Nunito Sans', sans-serif;

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

    border-left: 2px solid #ccc;
}

#filtro #buscarFGBTN {
    padding: 8px 16px;

    background-color: #007bff;

    color: #fff;
    font-size: 1rem;
    border: none;
    border-radius: 4px;

    cursor: pointer;

    transition: background-color 0.2s ease;
}

#filtro #buscarFGBTN:hover {
    background-color: #0056b3;
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
}

/* Lista de elementos */
#lista {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
    padding: 10px;
}

/* Estilo de cada elemento de la guia */
.elemento {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.elemento:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>