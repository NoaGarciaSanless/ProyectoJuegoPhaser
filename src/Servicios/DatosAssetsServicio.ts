import { EnemigoDTO } from "../DTOs/EnemigoDTO";
import { PersonajeDTO } from "../DTOs/PersonajeDTO";
import { auth, db } from "./ConexionFirebase";
import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    where,
} from "firebase/firestore";

export function recogerPersonajes() {
    return new Promise<PersonajeDTO[]>(async (resolve, reject) => {
        try {
            const tabla = collection(db, "personajes");

            let resultado = await getDocs(tabla);

            if (!resultado.empty) {
                let lista: PersonajeDTO[] = [];

                resultado.forEach((registro) => {
                    const valores = registro.data();

                    lista.push(
                        new PersonajeDTO(
                            registro.id,
                            valores.nombre,
                            valores.descripcion,
                            valores.ataqueBase,
                            valores.ataquePorNivel,
                            valores.defensaBase,
                            valores.defensaPorNivel,
                            valores.ataqueMagicoBase,
                            valores.ataqueMagicoPorNivel,
                            valores.precisionBase,
                            valores.criticoBase,
                            valores.debilidad,
                            valores.fortaleza,
                            valores.habilidades,
                            valores.spriteURL,
                            valores.jsonURL
                        )
                    );
                });

                resolve(lista);
            } else {
                console.log("No se encontraron personajes.");
                throw Error("No se han encontrado personajes.");
            }
        } catch (error) {
            console.log(error);

            reject(error);
        }
    });
}

export function recogerEnemigos() {
    return new Promise<EnemigoDTO[]>(async (resolve, reject) => {
        try {
            const tabla = collection(db, "enemigos");

            let resultado = await getDocs(tabla);

            if (!resultado.empty) {
                let lista: EnemigoDTO[] = [];

                resultado.forEach((registro) => {
                    const valores = registro.data();

                    lista.push(
                        new EnemigoDTO(
                            registro.id,
                            valores.nombre,
                            valores.descripcion,
                            valores.ataqueBase,
                            valores.ataquePorNivel,
                            valores.defensaBase,
                            valores.defensaPorNivel,
                            valores.ataqueMagicoBase,
                            valores.ataqueMagicoPorNivel,
                            valores.precisionBase,
                            valores.criticoBase,
                            valores.debilidad,
                            valores.fortaleza,
                            valores.habilidades,
                            valores.spriteURL,
                            valores.jsonURL
                        )
                    );
                });

                resolve(lista);
            } else {
                console.log("No se encontraron enemigos.");
                throw Error("No se han encontrado enemigos.");
            }
        } catch (error) {
            console.log(error);

            reject(error);
        }
    });
}
