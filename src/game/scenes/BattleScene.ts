import { GameObjects} from "phaser";

import Phaser from "phaser";

export default class BattleScene extends Phaser.Scene {

    forestBg:GameObjects.Image;

    constructor() {
        super("BattleScene");
    }

    preload() {
        // Aquí cargas los recursos como imágenes o sonidos
        this.load.image("forestBG", "assets/backgrounds/bosque.png");
    }

    create() {
        // Obtén las dimensiones de la escena
        const { width, height } = this.scale;

        // Aquí creas los objetos del juego, como el jugador o enemigos
        this.forestBg = this.add.sprite(0, 0, "forestBG");

        this.forestBg.setOrigin(0, 0); // Coloca el punto de origen en la esquina superior izquierda
        this.forestBg.setDisplaySize(width, height /1.5); // Escala la imagen para ocupar el espacio deseado
    }

    update() {
        // Aquí gestionas la lógica de actualización del juego, como el movimiento
       
    }
}
