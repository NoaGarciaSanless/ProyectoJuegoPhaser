import { log } from "console";
import { GameObjects } from "phaser";

import Phaser from "phaser";

export default class BattleScene extends Phaser.Scene {
    forestBg: GameObjects.Image;
    ground: GameObjects.Image;

    constructor() {
        super("BattleScene");
    }

    preload() {
        // Aquí cargas los recursos como imágenes o sonidos
        this.load.image("forestBG", "assets/backgrounds/bosque.png");
        this.load.image("ground", "assets/backgrounds/suelo.png");

        this.load.aseprite(
            "trees",
            "assets/decoraciones/assetsNaturaleza.png",
            "assets/decoraciones/assetsNaturaleza.json"
        );
    }

    create() {
        const { width, height } = this.scale;

        const treeFrames = ["Arbol-0", "Arbol-1", "Arbol-2"];

        function createRandomTrees(this: BattleScene) {
            let numTrees = Math.trunc(Math.max(Math.random() * 4));

            let usedX: number[] = [];

            for (let i = 0; i <= numTrees; i++) {
                const treeKey = Phaser.Math.RND.pick(treeFrames);
                let xPos = Phaser.Math.Between(0, -4.32);

                do {
                    xPos = Phaser.Math.FloatBetween(-4.32, 0);
                } while (usedX.some((used) => Math.abs(used - xPos) < 0.5));

                usedX.push(xPos);

                this.add
                    .sprite(0, groundY - 200, "trees", treeKey)
                    .setOrigin(xPos, 0.5)
                    .setScale(2.5, 2.5);
            }
        }

        this.forestBg = this.add.sprite(0, 0, "forestBG");

        this.forestBg.setOrigin(0, 0);
        this.forestBg.setDisplaySize(width, height / 1.5);

        const groundY = this.forestBg.displayHeight;

        this.ground = this.add.sprite(0, groundY, "ground");
        this.ground.setOrigin(0.1, 0.4);
        this.ground.setDisplaySize(width * 1.3, (height - groundY) * 2);

        createRandomTrees.call(this);

        // Load the HUD in top of this scene
        this.scene.launch("BattleHUD");
    }

    update() {
        // Aquí gestionas la lógica de actualización del juego, como el movimiento
    }
}
