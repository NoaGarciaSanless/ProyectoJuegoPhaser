import { GameObjects, RIGHT } from "phaser";

import Phaser from "phaser";
import BattleScene from "./BattleScene";

// Plugin to change the color in some text easily
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import { IInventoryItem } from "../objects/IInventoryItem";

export default class BattleHUD extends Phaser.Scene {
    rexUI: RexUIPlugin;

    // Containers to group the elements of the scene
    buttonContainer: GameObjects.Container;
    textContainer: GameObjects.Container;

    // Sprites used in the scene
    // Buttons
    atkBTN: GameObjects.Sprite;
    defBTN: GameObjects.Sprite;
    invBTN: GameObjects.Sprite;

    // Health bars
    healthBars: { [key: string]: any } = {};

    // Player inventory
    playerBattleInventoryMax: number = 0;
    inventoryList: Record<string, IInventoryItem> = {};
    inventoryArray: Array<IInventoryItem> = [];
    inventory: any;

    // Other scenes
    battleScene: BattleScene;

    // Variables to control buttons
    canAttack = true;
    invOpen = false;

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

        this.load.aseprite(
            "resources",
            "assets/UI/game_resources/recursos.png",
            "assets/UI/game_resources/recursos.json"
        );

        this.load.image("backbutton", "assets/buttons/back.png");

        this.load.image(
            "inventoryBackground",
            "assets/UI/inventory/inventoryBackground.png"
        );

        this.load.image(
            "inventorySlot",
            "assets/UI/inventory/inventorySlot.png"
        );
    }

    create() {
        const { width, height } = this.scale;

        // Other scenes
        this.battleScene = this.scene.get("BattleScene") as BattleScene;

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
            .sprite(0, 0, "buttons", 0)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width / 10, height / 10);
        this.atkBTN.setInteractive();

        this.defBTN = this.add
            .sprite(0, 0, "buttons", 2)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width / 10, height / 10);
        this.defBTN.setInteractive();

        this.invBTN = this.add
            .sprite(0, 0, "buttons", 4)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width / 10, height / 10);
        this.invBTN.setInteractive();

        // Adds the buttons to the container
        let btnList = [this.atkBTN, this.defBTN, this.invBTN];
        this.buttonContainer.add(btnList);
        this.arrangeElements(btnList, width);

        // Healthbars -----------------------------------------

        // BattleInventory ------------------------------------
        setTimeout(() => {
            this.playerBattleInventoryMax =
                this.battleScene.playerBattleInventoryMax;
            this.inventoryList = this.battleScene.inventory;
            this.inventoryArray = Object.values(this.inventoryList);

            this.createInventory(width / 2, height / 2);
        }, 50);

        // Events ---------------------------------------------
        // Button functionality
        this.atkBTN.on("pointerdown", () => {
            // If the player can attack, plays the character attack animation
            if (this.canAttack) {
                this.atkBTN.setFrame(1);

                // Activates the attack in the BattleScene
                this.battleScene.events.emit("character-attack");
                this.canAttack = false;
            }
        });

        this.atkBTN.on("pointerup", () => {
            this.atkBTN.setFrame(0);
        });

        this.invBTN.on("pointerdown", () => {
            this.invBTN.setFrame(5);
            this.toggleInventory();
        });

        this.invBTN.on("pointerup", () => {
            this.invBTN.setFrame(4);
        });

        // --------------------------------------------------------

        this.events.on("allow-attack", () => {
            this.canAttack = true;
        });

        this.events.on("cancel-attack", () => {
            this.canAttack = false;
        });

        // Characters health bars
        this.events.on(
            "create_health_bar",
            (posX: number, posY: number, health: number, key: string) => {
                this.createHealthBar(posX, posY, health, key);
            }
        );

        // Updates the characters health bar
        this.events.on("update_health_bar", (quantity: number, key: string) => {
            this.updateHealthBar(quantity, key);
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
                quantity: number,
                character: string,
                action: string,
                target?: string
            ) => {
                this.showTurnText(quantity, character, action, target);
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

    // Functions **********************************************

    // Inventory --------------------

    createInventory(x: number, y: number) {
        // If the player has no inventory, it doesn't create the inventory container
        if (this.playerBattleInventoryMax <= 0) return;

        const scrollMode = 0;

        const invWidth = 800;
        const invHeight = 500;

        const columns = 5;
        const rows = Math.ceil(this.playerBattleInventoryMax / columns);
        const cellWidth = 150;
        const cellHeight = 150;

        const totalTableWidth = columns * cellWidth;
        const totalTableHeight = rows * cellHeight;

        // Padding if there are more than 2 rows
        const padding = 20;

        // Other elements
        let inventoryHeader = this.createInventoryHeader(invWidth, invHeight);

        // Inventory
        this.inventory = this.rexUI.add
            .gridTable({
                x,
                y,
                width: invWidth,
                height: invHeight,
                background: this.add.image(0.5, 0.5, "inventoryBackground"),

                scrollMode: scrollMode,

                table: {
                    cellWidth: cellWidth,
                    cellHeight: cellHeight,
                    columns: columns,
                },

                // Centers the table
                space: {
                    left: Math.max((invWidth - totalTableWidth) / 2, 0),
                    right: Math.max((invWidth - totalTableWidth) / 2, 0),
                    top: padding,
                    bottom: padding,
                    header: 100,
                },

                mouseWheelScroller: {
                    focus: false,
                    speed: 0.1,
                },

                items: new Array(this.playerBattleInventoryMax).fill(null),

                //https://codepen.io/rexrainbow/pen/pooZWme?editors=0010
                header: inventoryHeader,

                createCellContainerCallback: function (
                    cell: {
                        index: any;
                        scene: any;
                        width: number;
                        height: number;
                    },
                    cellContainer
                ) {
                    const scene = cell.scene,
                        width = cell.width,
                        height = cell.height,
                        index = cell.index;

                    const item = scene.inventoryArray[index];

                    if (cellContainer === null) {
                        cellContainer = scene.add.container(0, 0);

                        const slotImage = scene.add
                            .image(0, 0, "inventorySlot")
                            .setDisplaySize(width * 0.8, height * 0.8)
                            .setOrigin(0.5);

                        slotImage.setPosition(width * 0.5, height * 0.5);
                        slotImage.name = "slotBackground";
                        cellContainer?.add(slotImage);

                        if (item) {
                            const itemImage = scene.add
                                .sprite(0, 0, "resources", item.texture)
                                .setDisplaySize(width * 0.6, height * 0.6)
                                .setOrigin(0.5);

                            itemImage.setPosition(width * 0.5, height * 0.5);
                            itemImage.name = "itemImage";
                            cellContainer?.add(itemImage);

                            const itemText = scene.rexUI.add.BBCodeText(
                                width - 50,
                                height / 1.5,
                                item.quantity,
                                {
                                    fontFamily: "MyCustomFont",
                                    fontSize: "32px",
                                    color: "#000000",
                                }
                            );
                            itemText.name = "itemText";
                            cellContainer?.add(itemText);

                            // Add a transparent overlay as the topmost layer
                            const clickOverlay = scene.add.rectangle(
                                width * 0.5,
                                height * 0.5,
                                width,
                                height,
                                0x000000,
                                0
                            );
                            clickOverlay.setInteractive();
                            clickOverlay.setDepth(10);
                            clickOverlay.name = "clickOverlay";

                            clickOverlay.on("pointerdown", () => {
                                scene.battleScene.events.emit("use-item", item);

                                let itemTextChild = cellContainer?.list.find(
                                    (child) => child.name === "itemText"
                                );

                                itemTextChild.setText(item.quantity.toString());

                                scene.toggleInventory();
                                scene.invBTN.setFrame(4);
                            });

                            cellContainer?.add(clickOverlay);
                        }
                    }

                    return cellContainer;
                },
            })
            .layout();

        this.inventory.setVisible(false);
    }

    createInventoryHeader(width: number, height: number) {
        let backBTN = this.add
            .image(width / 2 - 50, 80, "backbutton")
            .setDisplaySize(90, 80)
            .setOrigin(1, 0.9);

        backBTN.setInteractive();

        backBTN.on("pointerdown", () => {
            this.toggleInventory();
            this.invBTN.setFrame(4);
        });

        let inventoryHeader = this.add.container(0, 0);
        inventoryHeader.add([backBTN]);
        inventoryHeader.setDepth(10);

        return inventoryHeader;
    }

    // Shows the inventory and makes the rest of the elements no interactive
    toggleInventory() {
        if (this.inventory) {
            this.inventory.setVisible(!this.inventory.visible);
            this.invOpen = !this.invOpen;

            // Allows to use other buttons
            if (this.invOpen) {
                this.atkBTN.disableInteractive();
                this.defBTN.disableInteractive();
                this.invBTN.disableInteractive();
            } else {
                this.atkBTN.setInteractive();
                this.defBTN.setInteractive();
                this.invBTN.setInteractive();
            }
        }
    }

    refreshInventory() {}

    // Turn texts -------------------
    showTurnText(
        quantity: number,
        character: string,
        action: string,
        target?: string
    ) {
        let messageText = "";

        if (action === "showTurn") {
            messageText = `Turn ${quantity}`;

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

            messageText += `has dealt  [color=yellow]${quantity} damage[/color]  `;

            if (target == "player") {
                messageText += `to [color=green]${target}[/color] `;
            } else {
                messageText += `to [color=red]${target}[/color] `;
            }
        } else if (action === "heal") {
            if (character == "player") {
                messageText += `The [color=green]${character}[/color] `;
            } else {
                messageText += `The [color=red]${character}[/color] `;
            }

            messageText += `has recovered  [color=yellow]${quantity} health[/color]  `;
        } else if (action === "miss") {
            if (character == "player") {
                messageText += `The [color=green]${character}[/color] `;
            } else {
                messageText += `The [color=red]${character}[/color] `;
            }

            messageText += `has missed an attack`;
        }

        let message = this.rexUI.add.BBCodeText(0, 0, messageText, {
            fontFamily: "MyCustomFont",
            fontSize: "24px",
            color: "#ffffff",
        });

        // Adds the text to the container and centers it in the container
        this.textContainer.add(message);
        message.setOrigin(0.5, 0.5);

        let totalMessages = this.textContainer.length - 2;

        message.y = 40 + totalMessages * 40;
    }

    // Health bars ------------------
    createHealthBar(posX: number, posY: number, health: number, key: string) {
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

    updateHealthBar(quantity: number, key: string) {
        let barToUpdate = this.healthBars[key];

        if (barToUpdate) {
            barToUpdate.setValue(quantity, 0, 100);
            barToUpdate.text = `${quantity}HP`;

            // Obtains the slider
            let slider = barToUpdate.getElement
                ? barToUpdate.getElement("slider")
                : null;

            // The indicator tha shows the actual amount of health
            let indicator = slider.getElement
                ? slider.getElement("indicator")
                : null;

            // If the character has no health hides the indicator to show an empty bar
            if (quantity <= 0) {
                indicator.setVisible(false);
            } else {
                indicator.setVisible(true);
            }
        }
    }

    update() {}

    destroy() {
        this.events.removeAllListeners();
        this.children.removeAll();
        this.textures.destroy();
    }
}
