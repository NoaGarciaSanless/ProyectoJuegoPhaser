import { GameObjects } from "phaser";

import Phaser from "phaser";
import BattleHUD from "./BattleHUD";

// States of the battle
enum BattleState {
    PlayerTurn,
    EnemyTurn,
    Animation,
    EndTurn,
}

export default class BattleScene extends Phaser.Scene {
    // Sprites used in the scene
    forestBg: GameObjects.Image;
    ground: GameObjects.Image;
    character: GameObjects.Sprite;
    enemy1: GameObjects.Sprite;

    // Other scenes
    battleHUD: BattleHUD | undefined;

    // Variables for the battle logic
    currentState: BattleState = BattleState.PlayerTurn;

    playerHealth: number = 100;
    enemyHealth: number = 100;

    constructor() {
        super("BattleScene");
    }

    preload() {
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
        this.battleHUD = this.scene.get("BattleHUD") as BattleHUD;

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
        // Character events....................................

        // Character attack
        this.events.on("character-attack", () => {
            // If its not the player turn it will not play the animation
            if (this.currentState !== BattleState.PlayerTurn) return;

            this.character.anims.timeScale = 0.8;
            this.character.play({ key: "Ataque" });

            // Esperar a que termine "Ataque" antes de reproducir "Idle"
            this.character.once("animationcomplete-Ataque", () => {
                this.enemy1.setTint(0xff0000);
                setTimeout(() => {
                    this.enemy1.clearTint();
                }, 500);

                this.character.play({ key: "Idle_combate", repeat: -1 });
                this.character.anims.timeScale = 0.3;

                this.currentState = BattleState.Animation;
                this.nextTurn();
            });
        });
    }

    // Function to control the turn logic
    async nextTurn() {
        if (this.currentState === BattleState.PlayerTurn) {
            // Let the player attack when the turn begins
            console.log("Player's Turn");
            this.battleHUD?.events.emit("allow-attack");
        } else if (this.currentState === BattleState.EnemyTurn) {
            // Waits for the enemy to finish it's action
            console.log("Enemy's Turn");
            await this.enemyAttack();

            // Moves to the next turn
            this.currentState = BattleState.EndTurn;
            this.nextTurn();
        } else if (this.currentState === BattleState.Animation) {
            setTimeout(() => {
                console.log("Animations playing");

                // Moves to the next turn
                this.currentState = BattleState.EnemyTurn;
                this.nextTurn();
            }, 2000);
        } else if (this.currentState === BattleState.EndTurn) {
            console.log("End Turn - Waiting...");
            setTimeout(() => {
                // Moves to the next turn
                this.currentState = BattleState.PlayerTurn;
                this.nextTurn();
                console.log("Player's Turn again");
            }, 1000);
        }
    }

    enemyAttack(): Promise<void> {
        return new Promise((resolve) => {
            this.enemy1.anims.timeScale = 0.8;
            this.enemy1.play("Ataque_izq");

            this.enemy1.once("animationcomplete-Ataque_izq", () => {
                this.character.setTint(0xff0000);
                setTimeout(() => {
                    this.character.clearTint();
                }, 500);

                this.enemy1.anims.timeScale = 0.3;
                this.enemy1.play({ key: "Idle_izq", repeat: -1 });

                setTimeout(() => {
                    resolve(); // Resolvemos la promesa cuando la animación ha terminado
                }, 500);
            });
        });
    }

    update() {}
}
