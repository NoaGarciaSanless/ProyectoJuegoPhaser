import { GameObjects } from "phaser";

import Phaser from "phaser";
import BattleScene from "./BattleScene";

// Plugin to change the color in some text easily
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

export default class BattleHUD extends Phaser.Scene {
    rexUI: RexUIPlugin;

    // Containers to group the elements of the scene
    buttonContainer: GameObjects.Container;
    textContainer: GameObjects.Container;

    // Sprites used in the scene
    // Buttons
    atkBTN: GameObjects.Sprite;
    defBTN: GameObjects.Sprite;

    // Health bars
    healthBars: { [key: string]: any } = {};

    // Other scenes
    battleScece: BattleScene;

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

        this.load.aseprite(
            "icons",
            "assets/UI/iconosUI_phaser.png",
            "assets/UI/iconosUI_phaser.json"
        );
    }

    create() {
        const { width, height } = this.scale;

        // Other scenes
        this.battleScece = this.scene.get("BattleScene") as BattleScene;

        // Variables to control buttons
        let canAttack = true;

        this.textContainer = this.add.container(width / 2, 0);

        const bgWidth = width / 2;
        const bgHeight = 150;

        // Background for the textcontainer
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.75);
        bg.fillRect(-bgWidth / 2, 20, bgWidth, bgHeight);

        this.textContainer.add(bg);

        // Buttons --------------------------------------------
        this.buttonContainer = this.add.container(width / 2, height - 100);

        this.atkBTN = this.add
            .sprite(0, 0, "buttons", "0")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width / 10, height / 10);
        this.atkBTN.setInteractive();

        this.defBTN = this.add
            .sprite(0, 0, "buttons", 2)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width / 10, height / 10);

        // Adds the buttons to the container
        let btnList = [this.atkBTN, this.defBTN];
        this.buttonContainer.add(btnList);
        this.arrangeElements(btnList, width);

        // Healthbars -----------------------------------------

        // Events ---------------------------------------------
        // Button functionality
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

        this.events.on("allow-attack", () => {
            canAttack = true;
        });

        this.events.on("cancel-attack", () => {
            canAttack = false;
        });

        // Characters health bars
        this.events.on(
            "create_health_bar",
            (posX: number, posY: number, health: number, key: string) => {
                let newHealthBar = this.rexUI.add
                    .numberBar({
                        x: posX,
                        y: posY + 115,
                        width: 300,
                        height: 20,
                        icon: this.add.sprite(0, 0, "icons", 0).setScale(2, 2),

                        slider: {
                            track: this.rexUI.add.roundRectangle(
                                0,
                                0,
                                0,
                                0,
                                10,
                                0x414040
                            ),
                            indicator: this.rexUI.add.roundRectangle(
                                0,
                                0,
                                0,
                                0,
                                10,
                                0xff1a1a
                            ),
                        },
                        text: this.add.text(0, 0, `${health}HP`, {
                            fontFamily: "MyCustomFont",
                            fontSize: "16px",
                            color: "#000",
                        }),
                        space: {
                            left: 10,
                            right: 10,
                            top: 10,
                            bottom: 10,
                            icon: 10,
                            slider: 10,
                        },
                    })
                    .layout();

                this.add.existing(newHealthBar);
                newHealthBar.setValue(health, 0, health);
                this.healthBars[key] = newHealthBar;
            }
        );

        // Updates the characters health bar
        this.events.on("update_health_bar", (cuantity: number, key: string) => {
            let barToUpdate = this.healthBars[key];

            if (barToUpdate) {
                barToUpdate.setValue(cuantity, 0, 100);
                barToUpdate.text = `${cuantity}HP`;

                // Obtains the slider
                let slider = barToUpdate.getElement
                    ? barToUpdate.getElement("slider")
                    : null;

                // The indicator tha shows the actual amount of health
                let indicator = slider.getElement
                    ? slider.getElement("indicator")
                    : null;

                // If the character has no health hides the indicator to show an empty bar
                if (cuantity <= 0) {
                    indicator.setVisible(false);
                } else {
                    indicator.setVisible(true);
                }
            }
        });

        // Victory GameOver Texts
        this.events.on("game_over", () => {
            let text = this.add.text(width, height / 2, "Game Over!", {
                fontFamily: "MyCustomFont",
                fontSize: "96px",
                color: "#ffffff",
            });

            this.tweens.add({
                targets: text,
                x: width / 3.5,
                duration: 1000,
                ease: "Power2",
            });
        });

        this.events.on("victory", () => {
            let text = this.add.text(0 - width * 0.2, height / 2, "Victory!", {
                fontFamily: "MyCustomFont",
                fontSize: "96px",
                color: "#ffffff",
            });

            this.tweens.add({
                targets: text,
                x: width / 3,
                duration: 1000,
                ease: "Power2",
            });
        });

        // Messages *******************************************
        // Turns
        this.events.on(
            "show_text",
            (
                cuantity: number,
                character: string,
                action: string,
                target?: string
            ) => {
                let messageText = "";

                if (action === "showTurn") {
                    messageText = `Turn ${cuantity}`;

                    let message = this.rexUI.add.BBCodeText(0, 0, messageText, {
                        fontFamily: "MyCustomFont",
                        fontSize: "32px",
                        color: "#ffffff",
                    });

                    this.textContainer.add(message);
                    message.setOrigin(0.5, 0.5);

                    message.x = 0;
                    message.y = 25;

                    return;
                }

                if (action === "attack") {
                    if (character == "player") {
                        messageText += `The [color=green]${character}[/color] `;
                    } else {
                        messageText += `The [color=red]${character}[/color] `;
                    }

                    messageText += `has dealt  [color=yellow]${cuantity} damage[/color]  `;

                    if (target == "player") {
                        messageText += `to [color=green]${target}[/color] `;
                    } else {
                        messageText += `to [color=red]${target}[/color] `;
                    }
                }

                let message = this.rexUI.add.BBCodeText(0, 0, messageText, {
                    fontFamily: "MyCustomFont",
                    fontSize: "24px",
                    color: "#ffffff",
                });

                // Adds the text to the container and centers it in the container
                this.textContainer.add(message);
                message.setOrigin(0.5, 0.5);

                console.log(this.textContainer.length);

                let totalMessages = this.textContainer.length - 2;

                message.y = 40 + totalMessages * 40;
            }
        );

        // Resets the container to 0
        this.events.on("clean_text", () => {
            const childrenList = this.textContainer.getAll();
            if (childrenList.length > 1) {
                for (let i = 1; i < childrenList.length; i++) {
                    childrenList[i].destroy();
                }
                this.textContainer.removeBetween(1);
            }
        });

        // Other messages
        this.events.on("extra_text", (text: string) => {
            let processedText = `[color=yellow]${text}[/color]`;
            let message = this.rexUI.add.BBCodeText(
                0 - width * 0.2,
                height / 2,
                processedText,
                {
                    fontFamily: "MyCustomFont",
                    fontSize: "64px",
                    color: "#ffffff",
                }
            );
            message.setOrigin(0.5, 0.5);

            this.tweens.add({
                targets: message,
                x: width / 2,
                duration: 1000,
                ease: "Power2",
            });

            setTimeout(() => {
                this.tweens.add({
                    targets: message,
                    x: width * 2,
                    duration: 1000,
                    ease: "Power2",
                    onComplete: () => {
                        message.destroy();
                    },
                });
            }, 1000);
        });
    }

    update() {}

    destroy() {
        this.events.removeAllListeners();
        this.children.removeAll();
        this.textures.destroy();
    }
}
