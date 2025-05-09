import { GameObjects } from "phaser";

export default class InicioEscena extends Phaser.Scene {
    fondo: GameObjects.Image;

    constructor() {
        super("InicioEscena");
    }

    preload() {
        this.load.image(
            "fondo",
            "https://res.cloudinary.com/juegoporturnosdaw-img/image/upload/v1746790809/bosque_g1slth.png"
        );
    }

    create() {
        const { width, height } = this.scale;

        this.fondo = this.add.sprite(0, 0, "fondo");
        this.fondo.setOrigin(0, 0);
        this.fondo.setDisplaySize(width, height);
    }
}
