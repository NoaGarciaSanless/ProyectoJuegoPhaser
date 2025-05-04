<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TarjetaDato from '../compartido/TarjetaDato.vue';
import { recogerPersonajes } from '../Servicios/DatosAssetsServicio';
import { PersonajeDTO } from '../DTOs/PersonajeDTO';
import { EnemigoDTO } from '../DTOs/EnemigoDTO';
import { MejoraDTO } from '../DTOs/MejoraDTO';


let lista = ref<(PersonajeDTO | EnemigoDTO | MejoraDTO)[]>([]);

onMounted(async () => {
    let listaPersonajes : PersonajeDTO[] = await recogerPersonajes();
    console.log(listaPersonajes);
    

    lista.value.push(...listaPersonajes);

    console.log(lista.value);
    
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
                <TarjetaDato v-for="(dato, index) in lista" :key="index" :dato="dato"></TarjetaDato>
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
    height: 100%;

    font-family: "Nunito Sans", sans-serif;

    display: flex;
    flex-direction: column;

    justify-content: center;
    align-items: center;
}

/* Formulario */
#filtro {
    width: 70%;

    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: space-between;
    align-items: center;

    border-bottom: 3px solid #9d9d9d;
}

#filtro h3 {
    padding: 10px;
    border-right: 3px solid #9d9d9d;
}

#filtro .botones {
    padding: 10px;
    margin-left: 80px;
    border-left: 3px solid #9d9d9d;
}

#filtro #buscarFGBTN {
    font-family: "Nunito Sans", sans-serif;
    font-size: larger;
}

.contenido {
    width: 100%;
    height: 100%;

    margin-top: 40px;

    background-color: bisque;
}
</style>