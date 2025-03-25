import { GameObjects } from "phaser";

import Phaser from "phaser";
import BattleHUD from "./BattleHUD";

import { IInventoryItem } from "../objects/IInventoryItem";

// States of the battle
enum BattleState {
    PlayerTurn,
    EnemyTurn,
    Animation,
    EndTurn,
    FinishScreen,
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
    lastState: BattleState = this.currentState;

    turn: number = 1;

    playerHealth: number = 100;
    enemyHealth: number = 100;

    playerBaseAtk: number = 10;
    enemyBaseAtk: number = 10;

    playerCritChance: number = 3;
    playerMissChance: number = 3;

    playerBattleInventoryMax: number = 10;

    inventory: Record<string, IInventoryItem> = {
        potion_sm: {
            name: "Small Potion",
            texture: "Vida_sml",
            quantity: 2,
            effect: () => {
                if (this.inventory["potion_sm"].quantity > 0) {
                    this.playerHealth = Math.min(this.playerHealth + 20, 100);
                    this.updateHealthBar(this.playerHealth, "player1");
                    this.showTurnText(20, "player", "heal");

                    this.inventory["potion_sm"].quantity--;

                    this.battleHUD!.events.emit("refresh-inventory");

                    this.currentState = BattleState.EndTurn;
                    this.nextTurn();
                }
            },
        },
    };

    // Enemy variables
    enemyMissChance: number = 3;

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

        // Iniziates the turn text
        this.time.delayedCall(50, () => {
            this.showTurnText(this.turn, "turns", "showTurn");
            this.turn++;
        });

        // Characters -----------------------------------------

        // Skeleton
        this.anims.createFromAseprite("skeleton");

        this.enemy1 = this.add
            .sprite(width / 1.5, height / 1.4, "skeleton", 16)
            .setOrigin(0.5, 0.5)
            .setScale(4, 4);

        this.enemy1.anims.timeScale = 0.3;
        this.enemy1.play({ key: "Idle_izq", repeat: -1 });

        this.playIdleAnimation(this.enemy1, "Idle_izq");

        this.time.delayedCall(50, () => {
            this.createHealthBar(
                this.enemy1.x,
                this.enemy1.y,
                this.enemyHealth,
                "enemy1"
            );
        });

        // Hood character
        this.anims.createFromAseprite("hood");

        this.character = this.add
            .sprite(width / 3.5, height / 1.4, "hood", 0)
            .setOrigin(0.5, 0.5)
            .setScale(4, 4);

        this.playIdleAnimation(this.character, "Idle_combate");

        this.time.delayedCall(50, () => {
            this.createHealthBar(
                this.character.x,
                this.character.y,
                this.playerHealth,
                "player1"
            );
        });

        // Events ---------------------------------------------
        // Character events....................................

        // Character attack
        this.events.on("character-attack", async () => {
            // If its not the player turn it will not play the animation
            if (this.currentState !== BattleState.PlayerTurn) return;

            // Waits for the player attack
            await this.playerAttack();
            this.currentState = BattleState.EndTurn;
            this.nextTurn();
        });

        // Character uses an item
        this.events.on("use-item", (item: IInventoryItem) => {
            item.effect();
        });
    }

    // Function to control the turn logic
    async nextTurn() {
        if (this.currentState === BattleState.PlayerTurn) {
            // Cleans the text for new round and shows the number of the new round
            this.battleHUD?.events.emit("clean_text");
            this.showTurnText(this.turn, "turns", "showTurn");
            this.turn++;

            console.log("Player's Turn");

            // Let the player attack when the turn begins
            this.battleHUD?.events.emit("allow-attack");

            return;
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
            if (this.playerHealth <= 0) {
                console.log("Game Over");

                this.battleHUD?.events.emit("game_over");
                this.playAnimation(this.character, "Derrota");

                this.currentState = BattleState.FinishScreen;
                this.nextTurn();
            } else if (this.enemyHealth <= 0) {
                console.log("Victory");

                this.battleHUD?.events.emit("victory");

                this.currentState = BattleState.FinishScreen;
                this.nextTurn();
            } else {
                setTimeout(() => {
                    console.log(
                        `Player:${this.playerHealth}, Enemy: ${this.enemyHealth}`
                    );

                    if (this.lastState === BattleState.PlayerTurn) {
                        this.currentState = BattleState.EnemyTurn;
                    } else if (this.lastState === BattleState.EnemyTurn) {
                        this.currentState = BattleState.PlayerTurn;

                        // setTimeout(
                        //     () => this.battleHUD?.events.emit("clean_text"),
                        //     500
                        // );
                    }
                    this.lastState = this.currentState;

                    // Moves to the next turn
                    this.nextTurn();
                }, 1000);
            }

            // Updates the health bars to show properly
            this.updateHealthBar(this.playerHealth, "player1");
            this.updateHealthBar(this.enemyHealth, "enemy1");
        } else if (this.currentState === BattleState.FinishScreen) {
            return;
        }
    }

    // Shows a text with the turn info, in the turn container
    showTurnText(
        cuantity: number,
        character: string,
        action: string,
        target?: string
    ) {
        this.battleHUD?.events.emit(
            "show_text",
            cuantity,
            character,
            action,
            target
        );
    }

    // Shows a text in the middle of the screen
    showMessage(text: string) {
        this.battleHUD?.events.emit("extra_text", text);
    }

    // Method to tell the HUD to create the health bar
    createHealthBar(posX: number, posY: number, health: number, key: string) {
        this.battleHUD?.events.emit(
            "create_health_bar",
            posX,
            posY,
            health,
            key
        );
    }

    // Method to update the healthbar
    updateHealthBar(cuantity: number, key: string) {
        this.battleHUD?.events.emit("update_health_bar", cuantity, key);
    }

    // Logic for the player attack
    playerAttack(): Promise<void> {
        return new Promise(async (resolve) => {
            await this.playAnimation(this.character, "Ataque");
            this.playIdleAnimation(this.character, "Idle_combate");

            let miss = this.calculateChance(this.playerMissChance);

            if (miss) {
                this.showTurnText(0, "player", "miss", "enemy1");

                setTimeout(() => {
                    resolve();
                }, 500);
            } else {
                this.enemy1.setTint(0xff0000);
                setTimeout(() => {
                    this.enemy1.clearTint();
                }, 500);

                // Calculates the damage of the attack
                let critical = this.calculateChance(this.playerCritChance);
                let totalAtk = this.playerBaseAtk * (critical ? 2 : 1);

                // Lowers the enemy health
                this.enemyHealth -= totalAtk;

                if (totalAtk > 0) {
                    this.updateHealthBar(this.enemyHealth, "enemy1");
                }

                if (critical) {
                    this.showMessage("Critical hit!");
                }

                this.showTurnText(totalAtk, "player", "attack", "enemy1");

                setTimeout(() => {
                    resolve();
                }, 500);
            }
        });
    }

    // Logic for the enemy attack
    enemyAttack(): Promise<void> {
        return new Promise(async (resolve) => {
            await this.playAnimation(this.enemy1, "Ataque_izq");
            this.playIdleAnimation(this.enemy1, "Idle_izq");

            let miss = this.calculateChance(this.playerMissChance);

            if (miss) {
                this.showTurnText(0, "enemy", "miss", "player");

                setTimeout(() => {
                    resolve();
                }, 500);
            } else {
                this.character.setTint(0xff0000);
                await this.playAnimation(this.character, "Dañado");
                setTimeout(() => {
                    this.character.clearTint();
                }, 500);
                this.playIdleAnimation(this.character, "Idle_combate");

                // Calculates the damage of the attack
                let critical = this.calculateChance(1);
                let totalAtk = this.enemyBaseAtk * (critical ? 2 : 1);

                // Lowers the player health
                this.playerHealth -= totalAtk;

                if (totalAtk > 0) {
                    this.updateHealthBar(this.playerHealth, "player1");
                }

                if (critical) {
                    this.showMessage("Critical hit!");
                }

                this.showTurnText(totalAtk, "enemy", "attack", "player");

                setTimeout(() => {
                    resolve();
                }, 500);
            }
        });
    }

    // Tells if the attack is critical or not
    calculateChance(critChance: number): Boolean {
        let number = Phaser.Math.Between(1, 10);

        if (number <= critChance) {
            return true;
        } else {
            return false;
        }
    }

    // Plays the given animation, if it exists, in the given character
    // Used for non Idle animation
    playAnimation(
        character: GameObjects.Sprite,
        animName: string
    ): Promise<void> {
        return new Promise((resolve) => {
            if (character.anims.animationManager.get(animName)) {
                character.anims.timeScale = 1;
                character.play(animName);

                // When the animation is complete restores the default value for the animation duration
                character.once(`animationcomplete-${animName}`, () => {
                    character.anims.timeScale = 0.3;
                    resolve();
                });
            } else {
                // Returns without playing the animation if it doesn't exist
                console.warn("The animation was not found");
                resolve();
            }
        });
    }

    // Plays the given animation, if it exists, in the given character
    // Used for Idle animation
    playIdleAnimation(
        character: GameObjects.Sprite,
        animName: string
    ): Promise<void> {
        return new Promise((resolve) => {
            if (character.anims.animationManager.get(animName)) {
                character.anims.timeScale = 0.3;
                character.play({ key: animName, repeat: -1 });

                resolve();
            } else {
                // Returns without playing the animation if it doesn't exist
                console.warn("The animation was not found");
                resolve();
            }
        });
    }

    update() {}

    destroy() {
        this.events.removeAllListeners();
        this.children.removeAll();
        this.textures.destroy();
    }
}
