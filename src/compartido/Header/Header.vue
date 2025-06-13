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
    <div
        id="componeteHeader"
        class="p-3 d-flex flex-row justify-content-between align-items-center gap-3"
    >
        <h1>Dominios Místicos</h1>
        <p id="nomUsuario" class="fs-4 m-0">{{ login }}</p>
        <button
            id="loginoutBTN"
            class="btn"
            :class="login ? 'cerrarSesion' : 'iniciarSesion'"
        >
            <span v-if="login" @click="cerrarSesion">Cerrar sesión</span>
            <span v-else @click="iniciarSesion">Iniciar sesión</span>
        </button>
    </div>
</template>

<style src="./Header.css" scoped></style>

