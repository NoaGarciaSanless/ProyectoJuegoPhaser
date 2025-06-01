import { GameObjects } from "phaser";
import { Assets } from "../../compartido/Assets";

export default class InicioEscena extends Phaser.Scene {
    fondo: GameObjects.Image;
    comenzarBTN: GameObjects.Sprite;

    constructor() {
        super("InicioEscena");
    }

    preload() {
        this.load.image("fondo", Assets.fondoBosque_sprite);

        this.load.aseprite(
            "comenzarBTN",
            Assets.comenzarBTN_sprite,
            Assets.comenzarBTN_json
        );
    }

    async create() {
        const { width, height } = this.scale;

        this.fondo = this.add.sprite(0, 0, "fondo");
        this.fondo.setOrigin(0, 0);
        this.fondo.setDisplaySize(width, height);

        this.comenzarBTN = this.add.sprite(0, 0, "comenzarBTN", 0);

        this.comenzarBTN.setOrigin(0.5, 0.5);
        this.comenzarBTN.setPosition(width / 1.6, height / 1.1);
        this.comenzarBTN.setScale(3, 3);
        this.comenzarBTN.setInteractive();

        // Animación botón
        this.comenzarBTN.on("pointerdown", () => {
            this.comenzarBTN.setFrame(1);
        });

        // let listaPersonajes: never[] = [];
        // let personajeSeleccionado: PersonajeDTO;

        // try {
        //     let listaPersonajes = await obtenerListaUsuarioActual();

        //     let idSel = listaPersonajes.find(
        //         (personaje: ElementoListaPersonajesDTO) => {
        //             return personaje.seleccionado;
        //         }
        //     );

        //     personajeSeleccionado =
        //         (await obtenerPersonaje(idSel!.personajeID ?? 0)) ??
        //         new PersonajeDTO();
        // } catch (error) {
        //     console.error("Error al obtener la lista de personajes:", error);
        // }

        // this.comenzarBTN.on("pointerup", () => {
        //     this.comenzarBTN.setFrame(0);
        //     this.cameras.main.fadeOut(1000, 0, 0, 0);

        //     this.scene.start("PuebloEscena", {
        //         listaPersonajes: listaPersonajes,
        //         personajeSeleccionado: personajeSeleccionado,
        //     });
        // });

        this.comenzarBTN.on("pointerup", () => {
            this.comenzarBTN.setFrame(0);
            this.cameras.main.fadeOut(1000, 0, 0, 0);

            this.scene.start("CargaEscena");
        });
    }
}
