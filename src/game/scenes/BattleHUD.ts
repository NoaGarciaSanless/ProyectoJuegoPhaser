import { GameObjects } from "phaser";

import Phaser from "phaser";
import BattleScene from "./BattleScene";

export default class BattleHUD extends Phaser.Scene {
    // Containers to group the elements of the scene
    buttonContainer: GameObjects.Container;

    // Sprites used in the scene
    // Buttons
    atkBTN: GameObjects.Sprite;
    defBTN: GameObjects.Sprite;

    // Other scenes
    battleScece: BattleScene;

    static events: any;

    // Function to distribute the elements in a container
    arrangeElements(buttons: GameObjects.Sprite[], containerWidth: number) {
        const spacing = 20;
        const totalWidth = buttons.reduce(
            (acc, button) => acc + button.displayWidth,
            0
        );
        const totalSpacing = spacing * (buttons.length - 1);

        const availableSpace = containerWidth - totalWidth - totalSpacing;
        const offsetX = -availableSpace / 2;

        buttons.forEach((button, index) => {
            button.x = offsetX + (button.displayWidth + spacing) * index;
        });
    }

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

        // Other scenes
        this.battleScece = this.scene.get("BattleScene") as BattleScene;

        // Variables to control buttons
        let canAttack = true;

        this.buttonContainer = this.add.container(width / 2, height - 100);

        this.atkBTN = this.add
            .sprite(0, 0, "buttons", "0")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width / 10, height / 10);
        this.atkBTN.setInteractive();
        // this.atkBTN.setPosition(20, height - 30);

        this.defBTN = this.add
            .sprite(0, 0, "buttons", 2)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width / 10, height / 10);

        // Adds the buttons to the container
        let btnList = [this.atkBTN, this.defBTN];
        this.buttonContainer.add(btnList);
        this.arrangeElements(btnList, width);

        // Events ---------------------------------------------
        this.atkBTN.on("pointerdown", () => {
            // If the player can attack, plays the character attack animation
            if (canAttack) {
                this.atkBTN.setFrame(1);

                // Activates the attack in the BattleScene
                this.battleScece.events.emit("character-attack");
                canAttack = false;
            }
        });

        this.atkBTN.on("pointerup", () => {
            this.atkBTN.setFrame(0);
        });

        // Events ---------------------------------------------
        // Button functionality
        this.events.on("allow-attack", () => {
            canAttack = true;
        });

        this.events.on("cancel-attack", () => {
            canAttack = false;
        });
    }

    update() {
        // Aquí gestionas la lógica de actualización del juego, como el movimiento
    }
}
