<script setup lang="ts">
import { ref } from 'vue';

import { registrarUsuario, iniciarSesionConUsuario } from '../Servicios/UsuariosServicio';

// Variables de vista
let login = ref(true);
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
    login.value = !login.value;
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
        mensajesError.value.registro = "La contraseña debe tener al menos 8 caracteres";
        return;
    }
    if (contrasenhaRegistro.value !== contrasenhaVRegistro.value) {
        mensajesError.value.registro = "Las contraseñas no coinciden";
        return;
    }

    registrarUsuario(nombreRegistro.value, emailRegistro.value, contrasenhaRegistro.value)
        .then((resultado) => {
            console.log(resultado);

        })
        .catch((error) => {
            console.log(error);

        });


}

// Loggea al usuario
function iniciarSesion() {
    mensajesError.value.login = "";

    if (!nombreLogin.value.trim()) {
        mensajesError.value.login = "El nombre de usuario o correo es requerido";
        return;
    }
    if (contrasenhaLogin.value.length < 6) {
        mensajesError.value.login = "La contraseña debe tener al menos 6 caracteres";
        return;
    }



    iniciarSesionConUsuario(nombreLogin.value, contrasenhaLogin.value)
        .then((resultado) => {
            console.log(resultado);

        }
        )
        .catch((error) => {
            if (typeof (error) === "string") {

                mensajesError.value.login = error;

            }
        });


}


</script>

<template>
    <div id="componeteLogin">

        <div class="contenedorTransicion" aria-live="polite">
            <transition name="fade" mode="out-in">
                <div id="login" v-if="login" key="login">
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

                            <p v-if="mensajesError.login">{{ mensajesError.login }}</p>

                            <button @click.prevent="iniciarSesion" class="enviarFormBTN">Login</button>
                        </form>

                    </div>

                    <div id="seccionRegistro">
                        <span>¿No tienes cuenta?</span>
                        <button @click="alternarFormulario" class="registro">Registrarse</button>
                    </div>
                </div>

                <div id="registro" v-else key="registro">
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

                            <p v-if="mensajesError.registro" class="error">{{ mensajesError.registro }}</p>

                            <button @click.prevent="registrar" class="enviarFormBTN">Registrarse</button>
                        </form>
                    </div>

                    <div class="opciones">
                        <button @click="alternarFormulario" class="cancelar">Cancelar</button>
                    </div>
                </div>
            </transition>
        </div>
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


/* Contenedor para la transición */
.contenedorTransicion {
    position: relative;
    width: 400px;
    /* Ancho fijo para evitar cambios de tamaño */
    min-height: 400px;
    /* Altura mínima para consistencia */
    display: flex;
    justify-content: center;
    align-items: center;
}
/* Efectos para la transición entre formularios */
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