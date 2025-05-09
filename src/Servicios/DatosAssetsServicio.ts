import { EnemigoDTO } from "../DTOs/EnemigoDTO";
import { PersonajeDTO } from "../DTOs/PersonajeDTO";
import { auth, db } from "./ConexionFirebase";
import { collection, getDocs } from "firebase/firestore";

// Recoge personajes, luego filtra por nombre y devulve los que coincidan
export function recogerPersonajes(nombre?: string) {
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

                if (nombre != null && nombre != "") {
                    lista = lista.filter((personaje) =>
                        personaje.nombre
                            .toLowerCase()
                            .includes(nombre?.trim().toLowerCase())
                    );
                }

                resolve(lista);
            } else {
                console.log("No se encontraron personajes.");
                resolve([]);
            }
        } catch (error) {
            console.log(error);

            reject(error);
        }
    });
}

// Recoge enemigos, luego filtra por nombre y devulve los que coincidan
export function recogerEnemigos(nombre?: string) {
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

                if (nombre != null && nombre != "") {
                    lista = lista.filter((personaje) =>
                        personaje.nombre
                            .toLowerCase()
                            .includes(nombre?.trim().toLowerCase())
                    );
                }

                resolve(lista);
            } else {
                console.log("No se encontraron enemigos.");
                resolve([]);
            }
        } catch (error) {
            console.log(error);

            reject([]);
        }
    });
}

// TODO: filtrar en el resto de tablas
// De momento filtra enemigos y personajes
export function filtrarLista(nombre: string, tipo: string) {
    return new Promise<any[]>(async (resolve, reject) => {
        try {
            // Almacena la lista resultante de todas las consultas
            let lista: any = [];
            // Resultado de la consulta

            // Si se le pasa un tipo, hace la consulta a ese tabla en concreto
            if (tipo != "") {
                const tabla = collection(db, tipo);

                let resultado = await getDocs(tabla);

                // Pasa el resultado a la lista
                if (!resultado.empty) {
                    resultado.forEach((registro) => {
                        // const valores = registro.data();

                        lista.push(registro.data());
                    });

                    if (nombre != null && nombre != "") {
                        lista = lista.filter((dato: any) =>
                            dato.nombre
                                .toLowerCase()
                                .includes(nombre?.trim().toLowerCase())
                        );
                    }

                    // Devuelve la lista
                    resolve([...lista]);
                } else {
                    console.log("No se encontraron datos.");
                    throw Error("No se han encontrado datos.");
                }
            } else {
                let personajes = await recogerPersonajes(nombre);
                let enemigos = await recogerEnemigos(nombre);

                lista.push(...personajes, ...enemigos);

                // Devuelve la lista
                resolve([...lista]);
            }
        } catch (error) {
            console.log(error);

            reject(error);
        }
    });
}

