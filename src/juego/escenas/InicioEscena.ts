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

        this.comenzarBTN = this.add.sprite(
            width * 0.5,
            height * 0.8,
            "comenzarBTN",
            0
        );

        this.comenzarBTN.setScale(5, 5);

        this.comenzarBTN.setInteractive();

        // Animación botón
        this.comenzarBTN.on("pointerdown", () => {
            this.comenzarBTN.setFrame(1);
        });

        this.comenzarBTN.on("pointerup", () => {
            this.comenzarBTN.setFrame(0);
            this.cameras.main.fadeOut(1000, 0, 0, 0);

            this.scene.start("CargaEscena");
        });
    }
}
