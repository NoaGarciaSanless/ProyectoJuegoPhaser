import { log } from "console";
import { GameObjects } from "phaser";

import Phaser from "phaser";

export default class BattleScene extends Phaser.Scene {
    forestBg: GameObjects.Image;
    ground: GameObjects.Image;
    character: GameObjects.Sprite;
    enemy1: GameObjects.Sprite;

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

        this.load.aseprite(
            "hood",
            "assets/characters/per_anim_phaser.png",
            "assets/characters/per_anim_phaser.json"
        );

        this.load.aseprite(
            "skeleton",
            "assets/enemies/skeleton/Esqueleto-phaser.png",
            "assets/enemies/skeleton/Esqueleto-phaser.json"
        );
    }

    create() {
        const { width, height } = this.scale;

        // Other scenes
        const battleHUD = this.scene.get("BattleHUD");

        // Frames for the sprites
        const treeFrames = ["Arbol-0", "Arbol-1", "Arbol-2"];

        // Functions ------------------------------------------

        // Creates a random amount of trees
        function createRandomTrees(this: BattleScene) {
            let numTrees = Math.trunc(Math.max(Math.random() * 4));

            let usedX: number[] = [];

            for (let i = 0; i <= numTrees; i++) {
                const treeKey = Phaser.Math.RND.pick(treeFrames);
                let xPos = Phaser.Math.Between(0, -4.32);

                do {
                    xPos = Phaser.Math.FloatBetween(-4.32, 0);
                } while (usedX.some((used) => Math.abs(used - xPos) < 0.9));

                usedX.push(xPos);

                this.add
                    .sprite(0, groundY - 200, "trees", treeKey)
                    .setOrigin(xPos, 0.5)
                    .setScale(3, 3);
            }
        }

        // Background -----------------------------------------

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

        // Characters -----------------------------------------

        // Skeleton
        this.anims.createFromAseprite("skeleton");

        this.enemy1 = this.add
            .sprite(0, 0, "skeleton", 16)
            .setOrigin(-5, -2.4)
            .setScale(4, 4);

        this.enemy1.anims.timeScale = 0.3;
        this.enemy1.play({ key: "Idle_izq", repeat: -1 });

        // Hood character
        this.anims.createFromAseprite("hood");

        this.character = this.add
            .sprite(0, 0, "hood", 0)
            .setOrigin(-1, -2.5)
            .setScale(4, 4);

        this.character.anims.timeScale = 0.3;
        this.character.play({ key: "Idle_combate", repeat: -1 });

        // Events ---------------------------------------------
        // Character events
        this.events.on("character-attack", () => {
            this.character.anims.timeScale = 0.8;
            this.character.play({ key: "Ataque" });

            // Esperar a que termine "Ataque" antes de reproducir "Idle"
            this.character.once("animationcomplete-Ataque", () => {
                this.character.play({ key: "Idle_combate", repeat: -1 });
                this.character.anims.timeScale = 0.3;

                battleHUD.events.emit("allow-attack");
            });
        });
    }

    update() {
        // Aquí gestionas la lógica de actualización del juego, como el movimiento
    }
}
