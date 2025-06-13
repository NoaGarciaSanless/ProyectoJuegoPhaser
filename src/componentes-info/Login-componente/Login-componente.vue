<script setup lang="ts">
import { onMounted, ref } from "vue";

import {
    registrarUsuario,
    iniciarSesionConUsuario,
    comprobarUsuario,
} from "../../Servicios/UsuariosServicio";

// Props
const props = defineProps({
    visible: Boolean,
});

// Eventos
const emit = defineEmits(["usuarioLogeado", "close"]);

// Variables de vista
let esLoginVista = ref(true);
let mensajesError = ref({
    login: "",
    registro: "",
});

let mensajeContraseña =
    "La contraseña debe contener mayúsculas, números y caractéres especiales";

// Variables de formulario
const nombreLogin = ref("");
const contrasenhaLogin = ref("");

const nombreRegistro = ref("");
const emailRegistro = ref("");
const contrasenhaRegistro = ref("");
const contrasenhaVRegistro = ref("");

// Funciones------------------------------------------

// Manejar la vista
function alternarFormulario() {
    esLoginVista.value = !esLoginVista.value;
    vaciarFormularios();
    mensajesError.value.registro = "";
    mensajesError.value.login = "";
}

function vaciarFormularios() {
    nombreLogin.value = "";
    contrasenhaLogin.value = "";
    nombreRegistro.value = "";
    emailRegistro.value = "";
    contrasenhaRegistro.value = "";
    contrasenhaVRegistro.value = "";
}

// Registro y login-----------------------------------

// Registra el usuario y lo loggea
function registrar() {
    console.log("Registro");
    mensajesError.value.registro = "";

    // Validaciones
    if (!nombreRegistro.value.trim()) {
        mensajesError.value.registro = "El nombre de usuario es requerido";
        return;
    }
    if (!emailRegistro.value || !emailRegistro.value.includes("@")) {
        mensajesError.value.registro = "El correo no es válido";
        return;
    }
    if (contrasenhaRegistro.value.length < 8) {
        mensajesError.value.registro =
            "La contraseña debe tener al menos 8 caracteres";
        return;
    }
    if (contrasenhaRegistro.value !== contrasenhaVRegistro.value) {
        mensajesError.value.registro = "Las contraseñas no coinciden";
        return;
    }

    registrarUsuario(
        nombreRegistro.value,
        emailRegistro.value,
        contrasenhaRegistro.value
    )
        .then((resultado) => {
            console.log(resultado);
            emit("usuarioLogeado", resultado);
            emit("close");
            vaciarFormularios();
        })
        .catch((error) => {
            mensajesError.value.registro = error;
        });
}

// Loggea al usuario
function iniciarSesion() {
    mensajesError.value.login = "";

    if (!nombreLogin.value.trim()) {
        mensajesError.value.login =
            "El nombre de usuario o correo es requerido";
        return;
    }

    iniciarSesionConUsuario(nombreLogin.value, contrasenhaLogin.value)
        .then((resultado) => {
            console.log(resultado);
            emit("usuarioLogeado", resultado);
            emit("close");
        })
        .catch((error) => {
            if (typeof error === "string") {
                mensajesError.value.login = error;
                console.log(error);
            }
        });
}

onMounted(async () => {
    let hayUsuario = await comprobarUsuario();

    emit("usuarioLogeado", hayUsuario);
});
</script>

<template>
    <div v-if="visible" class="modal d-block show">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div id="componeteLogin" class="modal-body d-flex flex-column">
                    <button
                        type="button"
                        class="btn-close align-self-end"
                        @click="emit('close')"
                    ></button>
                    <div class="d-flex flex-column gap-3" aria-live="polite">
                        <transition name="fade" mode="out-in">
                            <div
                                id="login"
                                v-if="esLoginVista"
                                key="login"
                                class="d-flex flex-column justify-content-center align-items-center gap-3"
                            >
                                <div
                                    class="contenedorForm p-3 d-flex flex-column justify-content-center align-items-center"
                                >
                                    <h3>Login</h3>
                                    <form>
                                        <div class="campo">
                                            <label
                                                for="loginLogin"
                                                class="form-label"
                                                >Usuario o email:
                                            </label>
                                            <input
                                                type="text"
                                                id="loginLogin"
                                                class="form-control"
                                                v-model="nombreLogin"
                                            />
                                        </div>

                                        <div class="campo">
                                            <label
                                                for="contrasenhaLogin"
                                                class="form-label"
                                                >Contraseña:
                                            </label>
                                            <input
                                                type="password"
                                                id="contrasenhaLogin"
                                                class="form-control"
                                                v-model="contrasenhaLogin"
                                            />
                                        </div>

                                        <p
                                            v-if="mensajesError.login"
                                            class="text-danger text-center"
                                        >
                                            {{ mensajesError.login }}
                                        </p>

                                        <button
                                            @click.prevent="iniciarSesion"
                                            class="enviarFormBTN"
                                        >
                                            Login
                                        </button>
                                    </form>
                                </div>

                                <div
                                    class="d-flex flex-row justify-content-center align-items-center gap-2"
                                >
                                    <span>¿No tienes cuenta?</span>
                                    <button
                                        @click="alternarFormulario"
                                        class="btn btn-warning"
                                    >
                                        Registrarse
                                    </button>
                                </div>
                            </div>

                            <div
                                class="d-flex flex-column justify-content-center align-items-center gap-3"
                                v-else
                                key="registro"
                            >
                                <div
                                    class="contenedorForm p-3 d-flex flex-column justify-content-center align-items-center"
                                >
                                    <h3>Registro</h3>
                                    <form>
                                        <div class="campo">
                                            <label
                                                for="loginRegistro"
                                                class="form-label"
                                                >Usuario:
                                            </label>
                                            <input
                                                type="text"
                                                id="loginRegistro"
                                                class="form-control"
                                                v-model="nombreRegistro"
                                            />
                                        </div>

                                        <div class="campo">
                                            <label
                                                for="emailRegistro"
                                                class="form-label"
                                                >Email:
                                            </label>
                                            <input
                                                type="email"
                                                id="emailRegistro"
                                                class="form-control"
                                                v-model="emailRegistro"
                                            />
                                        </div>

                                        <div class="campo">
                                            <label
                                                for="contrasenhaRegistro"
                                                class="form-label"
                                                >Contraseña:
                                            </label>
                                            <input
                                                type="password"
                                                id="contrasenhaRegistro"
                                                class="form-control"
                                                data-bs-toggle="tooltip"
                                                :title="mensajeContraseña"
                                                v-model="contrasenhaRegistro"
                                            />
                                        </div>

                                        <div class="campo">
                                            <label
                                                for="contrasenhaVRegistro"
                                                class="form-label"
                                                >Verifíca contraseña:
                                            </label>
                                            <input
                                                type="password"
                                                id="contrasenhaVRegistro"
                                                class="form-control"
                                                data-bs-toggle="tooltip"
                                                :title="mensajeContraseña"
                                                v-model="contrasenhaVRegistro"
                                            />
                                        </div>

                                        <p
                                            v-if="mensajesError.registro"
                                            class="text-danger text-center"
                                        >
                                            {{ mensajesError.registro }}
                                        </p>

                                        <button
                                            @click.prevent="registrar"
                                            class="enviarFormBTN"
                                        >
                                            Registrarse
                                        </button>
                                    </form>
                                </div>

                                <div
                                    class="d-flex flex-row justify-content-center align-items-center gap-1"
                                >
                                    <button
                                        @click="alternarFormulario"
                                        class="btn btn-dark"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style src="./Login-componente.css" scoped></style>

