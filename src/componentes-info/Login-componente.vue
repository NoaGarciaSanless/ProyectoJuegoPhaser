<script setup lang="ts">
import { ref } from 'vue';

import { registrarUsuario, iniciarSesionConUsuario } from '../Servicios/UsuariosServicio';
import { error } from 'console';

// Variables de vista
let login = ref(true);
let mesajesError = ref({
    login: "",
});

// Variables de formulario
let nombreLogin: string = "";
let contrasenhaLogin: string = "";

let nombreRegistro: string = "";
let emailRegistro: string = "";
let contrasenhaRegistro: string = "";
let contrasenhaVRegistro: string = "";



// Funciones------------------------------------------

// Manejar la vista
function alternarFormulario() {
    login.value = !login.value;
    vaciarFormularios();
}

function vaciarFormularios() {
    nombreLogin = "";
    contrasenhaLogin = "";

    nombreRegistro = "";
    emailRegistro = "";
    contrasenhaRegistro = "";
    contrasenhaVRegistro = "";

}

// Registro y login-----------------------------------

// Registra el usuario y lo loggea
function registrar() {
    if (emailRegistro != "" && contrasenhaRegistro != "" && contrasenhaVRegistro != "") {
        if (contrasenhaRegistro === contrasenhaVRegistro) {
            registrarUsuario(nombreRegistro, emailRegistro, contrasenhaRegistro);
        }
    }
}

// Loggea al usuario
function iniciarSesion() {
    if (nombreLogin != "" && contrasenhaLogin != "") {
        iniciarSesionConUsuario(nombreLogin, contrasenhaLogin)
            .then((resultado) => {

            }
            )
            .catch((error) => {
                if (typeof (error) === "string") {

                    if (error === "auth/invalid-email") {
                        mesajesError.value.login = error;
                    }
                    if (error === "auth/invalid-credential") {

                    }

                }
            });
    }

}


</script>

<template>
    <div id="componeteLogin">


        <transition name="fade">
            <div id="login" v-if="login">
                <div class="contenedorForm">
                    <h3>Login</h3>
                    <form>
                        <div class="campo">
                            <label for="loginLogin">Usuario o email: </label>
                            <input type="text" id="loginLogin" v-model="nombreLogin">
                        </div>

                        <div class="campo">
                            <label for="contrasenhaLogin">Contraseña: </label>
                            <input type="password" id="contrasenhaLogin" v-model="contrasenhaLogin">
                        </div>

                        <p v-if="mesajesError.login">{{ mesajesError.login }}</p>

                        <button @click.prevent="iniciarSesion" class="enviarFormBTN">Login</button>
                    </form>

                </div>

                <div id="seccionRegistro">
                    <span>¿No tienes cuenta?</span>
                    <button @click="alternarFormulario" class="registro">Registrarse</button>
                </div>
            </div>
        </transition>

        <transition name="fade">
            <div id="registro" v-if="!login">
                <div class="contenedorForm">
                    <h3>Registro</h3>
                    <form>
                        <div class="campo">
                            <label for="loginRegistro">Usuario: </label>
                            <input type="text" id="loginRegistro" v-model="nombreRegistro">
                        </div>

                        <div class="campo">
                            <label for="emailRegistro">Email: </label>
                            <input type="email" id="emailRegistro" v-model="emailRegistro">
                        </div>

                        <div class="campo">
                            <label for="contrasenhaRegistro">Contraseña: </label>
                            <input type="password" id="contrasenhaRegistro" v-model="contrasenhaRegistro">
                        </div>

                        <div class="campo">
                            <label for="contrasenhaVRegistro">Verifíca contraseña: </label>
                            <input type="password" id="contrasenhaVRegistro" v-model="contrasenhaVRegistro">
                        </div>

                        <button @click.prevent="registrar" class="enviarFormBTN">Registrarse</button>
                    </form>
                </div>

                <div class="opciones">
                    <button @click="alternarFormulario" class="cancelar">Cancelar</button>
                </div>
            </div>
        </transition>
    </div>

</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap');

/* Contenedor principal */
#componeteLogin {
    width: 100%;
    height: 100%;

    font-family: "Nunito Sans", sans-serif;

    display: flex;
    justify-content: center;
    align-items: center;
}

/* Efectos para la transición entre formularios */
/* TODO : Por ajustar */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Estilo de los contenedores de los formularios */
#login,
#registro {
    width: fit-content;
    padding: 40px;
    background-color: white;
    z-index: 100;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

.contenedorForm {
    padding: 20px;

    display: flex;
    flex-direction: column;
    align-items: center;


    border: 1px solid black;
    border-radius: 10px;
}


/* Estilo de los componetes de los formularios */
.campo {
    width: 100%;

    display: flex;
    justify-content: space-between;

    margin: 10px;
}

#seccionRegistro {
    flex: 1;
    margin-top: 10%;


    display: flex;
    flex-direction: row;
    gap: 10px;
}

form {
    flex: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.enviarFormBTN {
    width: 50%;
    margin-top: 5%;

    background-color: #71dd71;
    border: #71dd71;

    border-radius: 5px;
}


input {
    width: 50%;

}

/* Estilos botones */
button.registro {
    cursor: pointer;

    font-size: medium;

    background-color: #d8b064;
    border: #d8b064;

    border-radius: 2px;
}

button.registro:hover {
    background-color: #ecc377;
    border: #ecc377;

}

button.cancelar {
    cursor: pointer;

    font-size: medium;

    background-color: #d88564;
    border: #d88564;

    border-radius: 2px;

}

button.cancelar:hover {
    background-color: #ac694e;
    border: #ac694e;

}
</style>