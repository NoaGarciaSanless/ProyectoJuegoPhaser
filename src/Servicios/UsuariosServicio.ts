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
import { ElementoListaPersonajesDTO } from "../DTOs/PersonajeDTO";

// Registra un usuario comprobando que no exista otro con estas credenciales
export async function registrarUsuario(
    nombre: string,
    correo: string,
    contrasenha: string
) {
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

        const credenciales = await createUserWithEmailAndPassword(
            auth,
            correo,
            contrasenha
        );

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

        await crearListaPersonajesPorDefecto(nuevoUsuario.id);

        return credenciales.user.displayName;
    } catch (error: any) {
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

        if (error.code === "auth/password-does-not-meet-requirements") {
            mensajeError =
                "La contraseña debe contener mayúsculas, caracteres especiales y números";
        }

        throw "Error al iniciar sesión";
    }
}

// Permite al usuario iniciar sesión con correo o nombre de usuario
export async function iniciarSesionConUsuario(
    login: string,
    contrasenha: string
) {
    try {
        // Realiza una consulta para saber si hay un usuario con este nombre o correo
        let correo = login;

        // Si el login contiene @ consulta la propiedad 'correo' y si no la de usuario
        if (!login.includes("@")) {
            const tabla = collection(db, "usuarios");
            const consulta = query(tabla, where("nombre", "==", login));
            let resultado;

            resultado = await getDocs(consulta);

            if (resultado.empty) {
                throw "Usuario con estas credenciales no encontrado";
            }

            const usuario = resultado.docs[0];
            correo = usuario.data().correo;
        }

        // Inicia sesión
        const credenciales = await signInWithEmailAndPassword(
            auth,
            correo,
            contrasenha
        );

        await crearListaPersonajesPorDefecto(credenciales.user.uid);

        return credenciales.user.displayName;
    } catch (error: any) {
        // console.log(error?.code, error?.message);

        if (error.code === "auth/invalid-email") {
            throw "Correo no encontrado";
        }

        if (error.code === "auth/invalid-credential") {
            throw "Datos incorrectos para iniciar sesión";
        }

        if (typeof error === "string") {
            throw error;
        }

        throw "Error al iniciar sesión";
    }
}

// Comprueba las sesiones, si hay usuario devuelve su nombre
export function comprobarUsuario() {
    return new Promise<string>((resolve, reject) => {
        onAuthStateChanged(
            auth,
            (usuario) => {
                if (usuario) {
                    // console.log("Hay un usuario");
                    resolve(usuario.displayName!);
                } else {
                    // console.log("No hay usuario");
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
export async function cerrarSesionUsuario() {
    await auth.signOut();
}

// ---------------------------------------------
async function crearListaPersonajesPorDefecto(usuarioId: string) {
    // Crea la lista de personajes
    const listaRef = collection(db, "usuarios", usuarioId, "listaPersonajes");

    const listaPersonajes = await getDocs(listaRef);

    if (listaPersonajes.empty) {
        // Crear referencia a un nuevo documento con ID automático
        const nuevoPersonajeRef = doc(listaRef); // genera ID sin guardar aún

        let personajeInicial = new ElementoListaPersonajesDTO(
            nuevoPersonajeRef.id,
            1,
            0,
            1,
            true
        );

        await setDoc(nuevoPersonajeRef, personajeInicial.aObjetoJS());
    }
}
