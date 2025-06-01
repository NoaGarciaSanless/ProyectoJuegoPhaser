import { EnemigoDTO } from "../DTOs/EnemigoDTO";
import { ElementoListaPersonajesDTO, PersonajeDTO } from "../DTOs/PersonajeDTO";
import { auth, db } from "./ConexionFirebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";

// Recoge personajes, luego filtra por nombre y devulve los que coincidan
export function recogerPersonajes(nombre?: string) {
    return new Promise<PersonajeDTO[]>(async (resolve, reject) => {
        try {
            const tabla = collection(db, "personajes");
            let resultado = await getDocs(tabla);

            if (!resultado.empty) {
                let lista: PersonajeDTO[] = [];

                resultado.forEach((registro) => {
                    const valor = registro.data();

                    lista.push(
                        new PersonajeDTO(
                            registro.id,
                            valor.nombre,
                            valor.descripcion,
                            valor.ataqueBase,
                            valor.ataquePorNivel,
                            valor.defensaBase,
                            valor.defensaPorNivel,
                            valor.ataqueMagicoBase,
                            valor.ataqueMagicoPorNivel,
                            valor.precisionBase,
                            valor.criticoBase,
                            valor.debilidad,
                            valor.fortaleza,
                            valor.habilidades,
                            valor.spriteURL,
                            valor.jsonURL
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
                    const valor = registro.data();

                    lista.push(
                        new EnemigoDTO(
                            registro.id,
                            valor.nombre,
                            valor.descripcion,
                            valor.ataqueBase,
                            valor.ataquePorNivel,
                            valor.defensaBase,
                            valor.defensaPorNivel,
                            valor.ataqueMagicoBase,
                            valor.ataqueMagicoPorNivel,
                            valor.precisionBase,
                            valor.criticoBase,
                            valor.debilidad,
                            valor.fortaleza,
                            valor.habilidades,
                            valor.spriteURL,
                            valor.jsonURL
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
                        // const valor = registro.data();

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
                    console.log("No se encontraron valor.");
                    throw Error("No se han encontrado valor.");
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

// Obtiene un personaje por id
export async function obtenerPersonaje(id: number) {
    let personajeRef = doc(db, "personajes", `${id}`);
    let resultado = await getDoc(personajeRef);

    if (resultado.exists()) {
        let valor = resultado.data();

        let personaje = new PersonajeDTO(
            resultado.id,
            valor.nombre,
            valor.descripcion,
            valor.ataqueBase,
            valor.ataquePorNivel,
            valor.defensaBase,
            valor.defensaPorNivel,
            valor.ataqueMagicoBase,
            valor.ataqueMagicoPorNivel,
            valor.precisionBase,
            valor.criticoBase,
            valor.debilidad,
            valor.fortaleza,
            valor.habilidades,
            valor.spriteURL,
            valor.jsonURL
        );

        return personaje;
    }
}

// Obtiene la lista de personajes del usuario actual
export async function obtenerListaUsuarioActual(): Promise<
    ElementoListaPersonajesDTO[]
> {
    // Obtiene el usuario
    const usuario = auth.currentUser;
    if (!usuario) {
        throw new Error("No hay usuario");
    }

    const lista: ElementoListaPersonajesDTO[] = [];

    // Petición a la lista en la BD
    const listaRef = collection(db, "usuarios", usuario.uid, "listaPersonajes");
    const resultado = await getDocs(listaRef);
    resultado.forEach((personajeRegistro) => {
        const valor = personajeRegistro.data();

        lista.push(
            new ElementoListaPersonajesDTO(
                personajeRegistro.id,
                valor.personajeID,
                valor.experiencia,
                valor.nivel,
                valor.seleccionado
            )
        );
    });

    return lista;
}

