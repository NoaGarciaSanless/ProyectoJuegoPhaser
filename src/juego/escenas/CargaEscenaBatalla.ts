import {
    ElementoListaPersonajesDTO,
    PersonajeDTO,
} from "../../DTOs/PersonajeDTO";
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
        const datosEnemigo = await obtnerEnemigoAleatorio(
            data.estadisticas.nivel
        );

        // Los pasa a la escena de la batalla
        this.scene.start("EscenaBatalla", {
            personajeSeleccionado: data.personajeSeleccionado,
            estadisticas: data.estadisticas,
            enemigo: datosEnemigo.enemigoSeleccionado,
            nivelEnemigo: datosEnemigo.nivelEnemigo,
        });
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
