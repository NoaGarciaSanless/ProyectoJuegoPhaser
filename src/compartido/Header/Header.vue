<script setup lang="ts">
defineProps({
    login: String,
});

const emit = defineEmits(["cerrarSesion", "iniciarSesion"]);

function cerrarSesion() {
    emit("cerrarSesion");
}
function iniciarSesion() {
    emit("iniciarSesion");
}
</script>

<template>
    <div id="componeteHeader">
        <h1>Dominios Místicos</h1>
        <p id="nomUsuario">{{ login }}</p>
        <button id="loginoutBTN" :class="login ? 'cerrarSesion' : 'iniciarSesion'">
            <span v-if="login" @click="cerrarSesion">Cerrar sesión</span>
            <span v-else @click="iniciarSesion">Iniciar sesión</span>
        </button>
    </div>
</template>

<style src="./Header.css" scoped></style>

