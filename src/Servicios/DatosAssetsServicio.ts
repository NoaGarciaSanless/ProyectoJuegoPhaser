import { EnemigoDTO } from "../DTOs/EnemigoDTO";
import { ElementoListaPersonajesDTO, PersonajeDTO } from "../DTOs/PersonajeDTO";
import { auth, db } from "./ConexionFirebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
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
                            valor.tipoAtaquePrincipal,
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
                            valor.tipoAtaquePrincipal,
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
            valor.tipoAtaquePrincipal,
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

// Selecciona el personaje que elija el jugador y desselecciona el anterior
export async function seleccionarPersonaje(viejoID: number, nuevoID: number) {
    // Obtiene el usuario
    const usuario = auth.currentUser;
    if (!usuario) {
        throw new Error("No hay usuario");
    }

    // Tabla con la lista de personajes
    const listaRef = collection(db, "usuarios", usuario.uid, "listaPersonajes");

    // Petición a la lista en la BD para desseleccionar el actual
    const consulta = query(listaRef, where("seleccionado", "==", true));
    const resultado1 = await getDocs(consulta);

    if (!resultado1.empty) {
        for (const documento of resultado1.docs) {
            if (documento.data().personajeID === viejoID) {
                const docRef = doc(
                    db,
                    "usuarios",
                    usuario.uid,
                    "listaPersonajes",
                    documento.id
                );

                await updateDoc(docRef, { seleccionado: false });
            }
        }
    }

    // Marcar el nuevo personaje seleccionado
    const consultaNuevo = query(listaRef, where("personajeID", "==", nuevoID));
    const resultadoNuevo = await getDocs(consultaNuevo);

    if (resultadoNuevo.empty) {
        throw new Error("No se encontró el nuevo personaje");
    }

    const nuevoDocRef = doc(
        db,
        "usuarios",
        usuario.uid,
        "listaPersonajes",
        resultadoNuevo.docs[0].id
    );
    await updateDoc(nuevoDocRef, { seleccionado: true });
}

// Calcula el nivel en función de la experiencia acumulada
function calcularNivelPorExperiencia(expTotal: number): number {
    let nivel = 1;
    let expRestante = expTotal;

    // Del nivel 1 al 10: cada nivel necesita 500 de exp
    for (let i = 1; i <= 10; i++) {
        if (expRestante >= 500) {
            expRestante -= 500;
            nivel++;
        } else {
            return nivel;
        }
    }

    // Del nivel 11 al 30: cada nivel necesita 1000 de exp
    for (let i = 11; i <= 30; i++) {
        if (expRestante >= 1000) {
            expRestante -= 1000;
            nivel++;
        } else {
            return nivel;
        }
    }

    // Del nivel 31 al 40: cada nivel necesita 1500 de exp
    for (let i = 31; i <= 40; i++) {
        if (expRestante >= 1500) {
            expRestante -= 1500;
            nivel++;
        } else {
            return nivel;
        }
    }

    // A partir del nivel 41: cada nivel necesita 2000 de exp
    while (true) {
        if (expRestante >= 2000) {
            expRestante -= 2000;
            nivel++;
        } else {
            return nivel;
        }
    }
}

// Actualiza el nivel del personaje selecciónado
export async function actualizarEstadisticasPersonaje(
    id: number,
    expObtenida: number
) {
    // Obtiene el usuario
    const usuario = auth.currentUser;
    if (!usuario) {
        throw new Error("No hay usuario");
    }

    // Tabla con la lista de personajes
    const listaRef = collection(db, "usuarios", usuario.uid, "listaPersonajes");

    // Petición a la lista en la BD para desseleccionar el actual
    const consulta = query(listaRef, where("seleccionado", "==", true));
    const resultado = await getDocs(consulta);

    if (!resultado.empty) {
        let documento = resultado.docs[0];
        if (documento.data().personajeID === id) {
            const docRef = doc(
                db,
                "usuarios",
                usuario.uid,
                "listaPersonajes",
                documento.id
            );

            let elementoPersonajes = new ElementoListaPersonajesDTO(
                documento.id,
                documento.data().personajeID,
                documento.data().experiencia,
                documento.data().nivel,
                documento.data().seleccionado
            );

            elementoPersonajes.experiencia += expObtenida;

            // Calcular nuevo nivel real basado en total de experiencia
            const nuevoNivel = calcularNivelPorExperiencia(
                elementoPersonajes.experiencia
            );

            if (nuevoNivel > elementoPersonajes.nivel) {
                elementoPersonajes.nivel = nuevoNivel;
            }

            await updateDoc(docRef, {
                experiencia: elementoPersonajes.experiencia,
                nivel: elementoPersonajes.nivel,
            });
        }
    }
}

// Obtener enemigo aleatorio y su nivel en función del nivel del personaje
export async function obtnerEnemigoAleatorio(nivelPersonaje: number) {
    // Obtiene la lista y un ID de enemigo aleatorio
    const listaEnemigos = await recogerEnemigos();
    const enemigoID = Phaser.Math.Between(1, listaEnemigos.length);

    let enemigoSeleccionado = listaEnemigos.find(
        (e) => Number.parseInt(e.id) == enemigoID
    );

    let nivelEnemigo = Phaser.Math.Between(
        nivelPersonaje - 1,
        nivelPersonaje + 1
    );

    return {
        enemigoSeleccionado: enemigoSeleccionado,
        nivelEnemigo: nivelEnemigo > 0 ? nivelEnemigo : 1,
    };
}
