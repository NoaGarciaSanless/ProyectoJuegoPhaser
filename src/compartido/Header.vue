<script setup lang="ts">
defineProps({
    login: String,
})

const emit = defineEmits(['cerrarSesion']);

function cerrarSesion() {
    emit("cerrarSesion");
}


</script>

<template>
    <div id="componeteHeader">
        <h1>Dominios Místicos (provisional)</h1>

        <p id="nomUsuario">{{ login }}</p>
        <button id="loginoutBTN" :class="login ? 'cerrarSesion' : 'iniciarSesion'">
            <span v-if="login" @click="cerrarSesion">Cerrar sesión</span>
            <span v-else>Iniciar sesión</span>
        </button>
    </div>

</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap');

#componeteHeader {
    padding: 10px;

    background-color: #574d4f;

    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

#nomUsuario{
    font-family: "Nunito Sans", sans-serif;

}

#loginoutBTN {
    cursor: pointer;

    font-family: "Nunito Sans", sans-serif;
    font-size: larger;

    border: transparent;
    border-radius: 5px;

    margin: 20px;
}

#loginoutBTN.iniciarSesion {
    background-color: #6ee86e;
}

#loginoutBTN.iniciarSesion:hover {
    background-color: #80f180;
    transform: scale(1.01);
}

#loginoutBTN.cerrarSesion {
    background-color: #e76262;
}

#loginoutBTN.cerrarSesion:hover {
    background-color: #e44a4a;
    transform: scale(1.01);
}
</style>