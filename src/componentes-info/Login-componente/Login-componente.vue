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
            console.log(error);
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
    <div v-if="visible" class="modal-overlay">
        <div class="modal-content">
            <button @click="$emit('close')" class="close-btn">&times;</button>

            <div id="componeteLogin">
                <div class="contenedorTransicion" aria-live="polite">
                    <transition name="fade" mode="out-in">
                        <div id="login" v-if="esLoginVista" key="login">
                            <div class="contenedorForm">
                                <h3>Login</h3>
                                <form>
                                    <div class="campo">
                                        <label for="loginLogin">Usuario o email:
                                        </label>
                                        <input type="text" id="loginLogin" v-model="nombreLogin" />
                                    </div>

                                    <div class="campo">
                                        <label for="contrasenhaLogin">Contraseña:
                                        </label>
                                        <input type="password" id="contrasenhaLogin" v-model="contrasenhaLogin" />
                                    </div>

                                    <p v-if="mensajesError.login">
                                        {{ mensajesError.login }}
                                    </p>

                                    <button @click.prevent="iniciarSesion" class="enviarFormBTN">
                                        Login
                                    </button>
                                </form>
                            </div>

                            <div id="seccionRegistro">
                                <span>¿No tienes cuenta?</span>
                                <button @click="alternarFormulario" class="registro">
                                    Registrarse
                                </button>
                            </div>
                        </div>

                        <div id="registro" v-else key="registro">
                            <div class="contenedorForm">
                                <h3>Registro</h3>
                                <form>
                                    <div class="campo">
                                        <label for="loginRegistro">Usuario: </label>
                                        <input type="text" id="loginRegistro" v-model="nombreRegistro" />
                                    </div>

                                    <div class="campo">
                                        <label for="emailRegistro">Email: </label>
                                        <input type="email" id="emailRegistro" v-model="emailRegistro" />
                                    </div>

                                    <div class="campo">
                                        <label for="contrasenhaRegistro">Contraseña:
                                        </label>
                                        <input type="password" id="contrasenhaRegistro" v-model="contrasenhaRegistro" />
                                    </div>

                                    <div class="campo">
                                        <label for="contrasenhaVRegistro">Verifíca contraseña:
                                        </label>
                                        <input type="password" id="contrasenhaVRegistro"
                                            v-model="contrasenhaVRegistro" />
                                    </div>

                                    <p v-if="mensajesError.registro" class="error">
                                        {{ mensajesError.registro }}
                                    </p>

                                    <button @click.prevent="registrar" class="enviarFormBTN">
                                        Registrarse
                                    </button>
                                </form>
                            </div>

                            <div class="opciones">
                                <button @click="alternarFormulario" class="cancelar">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>

<style src="./Login-componente.css" scoped></style>
