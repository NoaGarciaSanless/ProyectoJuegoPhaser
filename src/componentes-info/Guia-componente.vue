<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TarjetaDato from '../compartido/TarjetaDato.vue';
import { recogerEnemigos, recogerPersonajes } from '../Servicios/DatosAssetsServicio';
import { PersonajeDTO } from '../DTOs/PersonajeDTO';
import { EnemigoDTO } from '../DTOs/EnemigoDTO';
import { MejoraDTO } from '../DTOs/MejoraDTO';


let lista = ref<(PersonajeDTO | EnemigoDTO | MejoraDTO)[]>([]);

onMounted(async () => {

    // Recoge los personajes para mostrarlos en la guia
    let listaPersonajes: PersonajeDTO[] = await recogerPersonajes();
    console.log(listaPersonajes);

    lista.value.push(...listaPersonajes);

    // Recoge los enemigos para mostrarlos en la guia
    let listaEnemigos: EnemigoDTO[] = await recogerEnemigos();
    console.log(listaEnemigos);

    lista.value.push(...listaEnemigos);


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
                <input type="text" id="nombre">
            </div>

            <div class="campo">
                <label for="tipo">Tipo: </label>
                <select id="tipo">
                    <option value="" disabled>--Selección de tipo--</option>
                    <option value="personaje">Personajes</option>
                    <option value="enemigo">Enemigos</option>
                    <option value="npc">Personajes no jugables</option>
                    <option value="mejora">Mejoras</option>
                    <option value="objeto">Objeto</option>
                </select>
            </div>

            <div class="botones">
                <button id="buscarFGBTN">Buscar</button>
            </div>

        </form>

        <div class="contenido">
            <div id="lista">
                <TarjetaDato class="elemento" v-for="(dato, index) in lista" :key="index" :dato="dato"></TarjetaDato>
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
    border-bottom: 2px solid #ccc;
    margin-bottom: 20px;
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
    border: none;
    border-radius: 4px;
    font-size: 1rem;
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