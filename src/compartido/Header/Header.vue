<script setup lang="ts">
defineProps({
    login: String,
});

const emit = defineEmits(["cerrarSesion"]);

function cerrarSesion() {
    emit("cerrarSesion");
}
</script>

<template>
    <div id="componeteHeader">
        <h1>Dominios Místicos (provisional)</h1>
        <p id="nomUsuario">{{ login }}</p>
        <button
            id="loginoutBTN"
            :class="login ? 'cerrarSesion' : 'iniciarSesion'"
        >
            <span v-if="login" @click="cerrarSesion">Cerrar sesión</span>
            <span v-else>Iniciar sesión</span>
        </button>
    </div>
</template>

<style src="./Header.css" scoped></style>

