// Registrarse en firebase
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { auth, db } from "./ConexionFirebase";
import { UsuarioDTO } from "../DTOs/UsuarioDTO";
import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    where,
} from "firebase/firestore";

// Registra un usuario comprobando que no exista otro con estas credenciales
export function registrarUsuario(
    nombre: string,
    correo: string,
    contrasenha: string
) {
    return new Promise(async (resolve, reject) => {
        try {
            // Realiza una consulta para saber si hay un usuario con estas credenciales
            let tabla = collection(db, "usuarios");
            let consulta = query(tabla, where("nombre", "==", nombre));
            let resultado = await getDocs(consulta);

            if (!resultado.empty) {
                // Obtinen los datos del usuario exitente
                const usuarioNombre = resultado.docs[0].data().nombre;

                // Si el usuario introducido es igual al recuperado manda un mensaje de usuario ya registrado
                if (usuarioNombre == nombre) {
                    throw new Error("Nombre de usuario ya en uso");
                }
            }

            createUserWithEmailAndPassword(auth, correo, contrasenha)
                .then(async (credenciales) => {
                    // Crea un DTO para el nuevo usuario
                    let nuevoUsuario = new UsuarioDTO(
                        credenciales.user.uid,
                        nombre,
                        correo,
                        "usuario"
                    );

                    // Guarda el usuario en FireStore
                    const docRef = doc(db, "usuarios", nuevoUsuario.id);
                    await setDoc(docRef, nuevoUsuario.aObjetoJS());

                    await updateProfile(credenciales.user, {
                        displayName: nombre,
                    });

                    console.log(credenciales.user);

                    resolve(credenciales.user.displayName);
                })
                .catch((error) => {
                    console.log(error.code);
                    let mensajeError = "";

                    if (error.code === "auth/email-already-in-use") {
                        mensajeError = "Este correo ya esta siendo utilizado";
                    }

                    if (error.code === "auth/invalid-email") {
                        mensajeError = "Este correo no es válido";
                    }

                    if (error.code === "auth/weak-password") {
                        mensajeError = "La contraseña es demasiado débil";
                    }

                    if (
                        error.code ===
                        "auth/password-does-not-meet-requirements"
                    ) {
                        mensajeError =
                            "La contraseña debe contener mayúsculas, caracteres especiales y números";
                    }

                    throw new Error(mensajeError);
                });
        } catch (error: any) {
            console.log(error);

            reject(error);
        }
    });
}

// Permite al usuario iniciar sesión con correo o nombre de usuario
export function iniciarSesionConUsuario(login: string, contrasenha: string) {
    return new Promise(async (resolve, reject) => {
        try {
            // Realiza una consulta para saber si hay un usuario con este nombre o correo
            let correo = login;

            // Si el login contiene @ consulta la propiedad 'correo' y si no la de usuario
            if (!login.includes("@")) {
                const tabla = collection(db, "usuarios");
                const consulta = query(tabla, where("nombre", "==", login));
                let resultado;

                try {
                    resultado = await getDocs(consulta);
                } catch (error: any) {
                    console.error(
                        "Error en la consulta de Firestore:",
                        error.message
                    );
                    throw new Error(
                        "Error al buscar el usuario: " + error.message
                    );
                }

                if (resultado.empty) {
                    throw new Error(
                        "Usuario con estas credenciales no encontrado"
                    );
                }

                const usuario = resultado.docs[0];
                correo = usuario.data().correo;
            }

            signInWithEmailAndPassword(auth, correo, contrasenha)
                .then((credenciales) => {
                    console.log(credenciales.user);
                    console.log("Usuario ha iniciado sesión");

                    resolve(credenciales.user.displayName);
                })
                .catch((error) => {
                    console.log(error.code);
                    console.log(error.message);

                    if (error === "auth/invalid-email") {
                        throw new Error("Correo no encontrado");
                    }
                    if (error === "auth/invalid-credential") {
                        throw new Error(
                            "Datos incorrectos para iniciar sesión"
                        );
                    }
                });
        } catch (error: any) {
            console.log(error);

            reject(error);
        }
    });
}

// Comprueba las sesiones, si hay usuario devuelve su nombre
export function comprobarUsuario() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(
            auth,
            (usuario) => {
                if (usuario) {
                    console.log("Hay un usuario");
                    resolve(usuario.displayName);
                } else {
                    console.log("No hay usuario");
                    resolve("");
                }
            },
            (error) => {
                console.log(error);
                reject("Ha ocurrido un error");
            }
        );
    });
}

// Log out del usuario
export function cerrarSesionUsuario() {
    auth.signOut();
}
