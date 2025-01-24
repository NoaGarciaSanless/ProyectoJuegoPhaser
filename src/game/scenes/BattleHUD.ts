import { log } from "console";
import { GameObjects } from "phaser";

import Phaser from "phaser";

export default class BattleHUD extends Phaser.Scene {
    atkBTN: GameObjects.Sprite;
    defBTN: GameObjects.Sprite;

    constructor() {
        super({ key: "BattleHUD", active: false, visible: true });
    }

    preload() {
        this.load.aseprite(
            "buttons",
            "assets/buttons/botones_anim.png",
            "assets/buttons/botones_anim.json"
        );
    }

    create() {
        const { width, height } = this.scale;

        // this.anims.createFromAseprite("buttons");

        this.atkBTN = this.add
            .sprite(0, 0, "buttons", "0")
            .setOrigin(0, 1)
            .setDisplaySize(width / 10, height / 10);
        this.atkBTN.setInteractive();
        this.atkBTN.setPosition(20, height - 30);

        this.atkBTN.on("pointerdown", () => {
            this.atkBTN.setFrame(1);
        });

        this.atkBTN.on("pointerup", () => {
            this.atkBTN.setFrame(0);
        });
    }

    update() {
        // Aquí gestionas la lógica de actualización del juego, como el movimiento
    }
}
