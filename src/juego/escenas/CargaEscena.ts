import {
    obtenerListaUsuarioActual,
    obtenerPersonaje,
} from "../../Servicios/DatosAssetsServicio";
import {
    ElementoListaPersonajesDTO,
    PersonajeDTO,
} from "../../DTOs/PersonajeDTO";

export default class CargaEscena extends Phaser.Scene {
    constructor() {
        super("CargaEscena");
    }

    async init() {
        try {
            // Obtener lista de personajes
            const listaPersonajes = await obtenerListaUsuarioActual();

            //Buscar el seleccionado
            const personajeSeleccionadoMeta = listaPersonajes.find(
                (p: ElementoListaPersonajesDTO) => p.seleccionado
            );

            if (!personajeSeleccionadoMeta) {
                throw new Error("No hay personaje seleccionado");
            }

            // Convierte el id en number a string
            const personajeSeleccionadoID = String(
                personajeSeleccionadoMeta.personajeID
            ).trim();

            //Obtiene la lista de TODOS los personajes del usuario
            // Cargar todos los personajes en paralelo
            const todosPersonajesUsuario = await Promise.all(
                listaPersonajes.map((registro) =>
                    obtenerPersonaje(registro.personajeID)
                )
            );
            // Filtrar por si alguno es null (por si un documento no existe)
            const personajesFiltrados = todosPersonajesUsuario.filter(
                (p): p is PersonajeDTO => p !== null && p !== undefined
            );

            //Obtener los datos del personaje seleccionado
            const personajeSeleccionado = personajesFiltrados.find(
                (p: PersonajeDTO) =>
                    String(p.id).trim() === personajeSeleccionadoID
            );
            if (!personajeSeleccionado) {
                throw new Error("No se pudo cargar el personaje seleccionado");
            }

            this.load.once("complete", () => {
                //Ir a la escena de inicio (o la que desees) con los datos cargados
                this.scene.start("PuebloEscena", {
                    listaPersonajes: listaPersonajes,
                    personajeSeleccionado: personajeSeleccionado,
                    todosPersonajesUsuario: personajesFiltrados,
                });
            });

            this.load.start();
        } catch (error) {
            console.error("Error durante la carga:", error);
            this.scene.start("InicioEscena");
        }
    }

    preload() {
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    create() {
        const { width, height } = this.scale;

        const texto = this.add.text(width / 2, height / 2, "Cargando...", {
            fontFamily: "MiFuente",
            fontSize: "32px",
            color: "#000000",
        });
        texto.setOrigin(0.5);
    }
}
