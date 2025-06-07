import { ElementoListaPersonajesDTO, PersonajeDTO } from "../../DTOs/PersonajeDTO";
import { obtnerEnemigoAleatorio } from "../../Servicios/DatosAssetsServicio";

export class CargaEscenaBatalla extends Phaser.Scene {
    constructor() {
        super("CargaEscenaBatalla");
    }

    async init(data: {
        personajeSeleccionado: PersonajeDTO;
        estadisticas: ElementoListaPersonajesDTO;
    }) {
        // Obtiene los datos del enemigo
        const datosEnemigo = await obtnerEnemigoAleatorio(data.estadisticas.nivel);

        // Los pasa a la escena de la batalla
        this.scene.start("EscenaBatalla", {
            personajeSeleccionado: data.personajeSeleccionado,
            estadisticas: data.estadisticas,
            enemigo: datosEnemigo.enemigoSeleccionado,
            nivelEnemigo: datosEnemigo.nivelEnemigo,
        });
    }
}