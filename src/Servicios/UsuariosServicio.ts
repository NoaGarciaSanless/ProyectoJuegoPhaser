// Registrarse en firebase

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./ConexionFirebase";
import { UsuarioDTO } from "../DTOs/UsuarioDTO";
import {  collection, doc, setDoc } from "firebase/firestore";

export function registrarUsuario(nombre: string, correo: string, contrasenha: string) {
    createUserWithEmailAndPassword(auth, correo, contrasenha)
        .then(async (credenciales) => {
            console.log(credenciales.user);

            let nuevoUsuario = new UsuarioDTO(credenciales.user.uid, nombre, correo, contrasenha);

            const docRef = doc(db, "usuarios", nuevoUsuario.id);

            await setDoc(docRef, nuevoUsuario.toPlainObject());

        })
        .catch((error) => {
            console.log(error.code);
            console.log(error.message);
        })
}

export function iniciarSesionConUsuario(nombre: string, correo: string, contrasenha: string) {
    return new Promise((resolve, reject) => {
        signInWithEmailAndPassword(auth, correo, contrasenha)
            .then((credenciales) => {
                console.log(credenciales.user);
                console.log("Usuario ha iniciado sesión");


                resolve(credenciales.user);
            })
            .catch((error) => {
                console.log(error.code);
                console.log(error.message);
                reject(error.code);
            })
    })

}