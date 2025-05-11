import { GameObjects, RIGHT } from "phaser";

import Phaser from "phaser";
import EscenaBatalla from "./BatallaEscena";

// Plugin para crear elementos y hacer textos de colores
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import { IObjeto } from "../../DTOs/ObjetoDTO";

export default class BatallaHUD extends Phaser.Scene {
    rexUI: RexUIPlugin;

    // Contenedores para agrupar los elementos en la escena
    contenedorBotones: GameObjects.Container;
    contenedorTexto: GameObjects.Container;

    // Sprites usados en la escena
    // Botones
    atkBTN: GameObjects.Sprite;
    defBTN: GameObjects.Sprite;
    invBTN: GameObjects.Sprite;

    // Barras de vida
    barrasVida: { [key: string]: any } = {};

    // Inventario del jugador
    inventarioJugadorMax: number = 0;
    listaInventario: Record<string, IObjeto> = {};
    arrayInventario: Array<IObjeto> = [];
    inventario: any;

    // Otras escenas
    batallaEscena: EscenaBatalla;

    // Variables para controlar los botones
    puedeAtacar = true;
    invAbierto = false;

    // Función para distribuir los botones en el contenedor de botones
    distribuirElementos(botones: GameObjects.Sprite[], anchoContenedor: number) {
        const espaciado = 20;
        const anchoTotal = botones.reduce(
            (acc, boton) => acc + boton.displayWidth,
            0
        );
        const espaciadoTotal = espaciado * (botones.length - 1);

        const espacioDisponible = anchoContenedor - anchoTotal - espaciadoTotal;
        const offsetX = -espacioDisponible / 2;

        botones.forEach((boton, index) => {
            boton.x = offsetX + (boton.displayWidth + espaciado) * index;
        });
    }

    constructor() {
        super({ key: "BatallaHUD", active: false, visible: true });
    }

    preload() {
        this.load.aseprite(
            "botones",
            "assets/buttons/botones_anim.png",
            "assets/buttons/botones_anim.json"
        );

        this.load.aseprite(
            "iconos",
            "assets/UI/iconosUI_phaser.png",
            "assets/UI/iconosUI_phaser.json"
        );

        this.load.aseprite(
            "recursos",
            "assets/UI/game_resources/recursos.png",
            "assets/UI/game_resources/recursos.json"
        );

        this.load.image("backbutton", "assets/buttons/back.png");

        this.load.image(
            "inventarioFondo",
            "assets/UI/inventory/inventoryBackground.png"
        );

        this.load.image(
            "inventarioSlot",
            "assets/UI/inventory/inventorySlot.png"
        );
    }

    create() {
        const { width, height } = this.scale;

        // Otras escenas
        this.batallaEscena = this.scene.get("EscenaBatalla") as EscenaBatalla;

        this.contenedorTexto = this.add.container(width / 2, 0);

        const bgWidth = width / 2;
        const bgHeight = 150;

        // Fondo para el contenedor de texto
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.75);
        bg.fillRect(-bgWidth / 2, 20, bgWidth, bgHeight);

        this.contenedorTexto.add(bg);

        // Botones --------------------------------------------
        this.contenedorBotones = this.add.container(width / 2, height - 100);

        this.atkBTN = this.add
            .sprite(0, 0, "botones", 0)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width / 10, height / 10);
        this.atkBTN.setInteractive();

        this.defBTN = this.add
            .sprite(0, 0, "botones", 2)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width / 10, height / 10);
        this.defBTN.setInteractive();

        this.invBTN = this.add
            .sprite(0, 0, "botones", 4)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width / 10, height / 10);
        this.invBTN.setInteractive();

        // Añade los botones al contenedor
        let btnList = [this.atkBTN, this.defBTN, this.invBTN];
        this.contenedorBotones.add(btnList);
        this.distribuirElementos(btnList, width);

        // Barras de vida -----------------------------------------

        // Inventario de batalla ------------------------------------

        // Un timeout para asegurarse de que estan todos los recursos necesarios
        // cargados antes de iniciar el inventario
        setTimeout(() => {
            this.inventarioJugadorMax =
                this.batallaEscena.inventarioBatallaJugadorMax;
            this.listaInventario = this.batallaEscena.inventario;
            this.arrayInventario = Object.values(this.listaInventario);

            this.crearInventario(width / 2, height / 2);
        }, 50);

        // Eventos ---------------------------------------------
        // Funcionalidad del boton de ataque
        this.atkBTN.on("pointerdown", () => {
            // Si el jugador puede atacar, hace la animación de ataque
            if (this.puedeAtacar) {
                this.atkBTN.setFrame(1);

                // Activa el ataque en la EscenaBatalla
                this.batallaEscena.events.emit("character-attack");
                this.puedeAtacar = false;
            }
        });

        this.atkBTN.on("pointerup", () => {
            this.atkBTN.setFrame(0);
        });

        this.invBTN.on("pointerdown", () => {
            this.invBTN.setFrame(5);
            this.alternarInventario();
        });

        this.invBTN.on("pointerup", () => {
            this.invBTN.setFrame(4);
        });

        // --------------------------------------------------------

        this.events.on("allow-attack", () => {
            this.puedeAtacar = true;
        });

        this.events.on("cancel-attack", () => {
            this.puedeAtacar = false;
        });

        // Barra de vida del personaje
        this.events.on(
            "create_health_bar",
            (posX: number, posY: number, health: number, key: string) => {
                this.crearBarraVida(posX, posY, health, key);
            }
        );

        // Actualiza la barra de vida del personaje
        this.events.on("update_health_bar", (quantity: number, key: string) => {
            this.actualizarBarraVida(quantity, key);
        });

        // Victory GameOver Textos
        this.events.on("game_over", () => {
            let text = this.add.text(width, height / 2, "Game Over!", {
                fontFamily: "MiFuente",
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
                fontFamily: "MiFuente",
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

        // Mensajes *******************************************
        // Turnos
        this.events.on(
            "show_text",
            (
                cantidad: number,
                personaje: string,
                accion: string,
                objetivo?: string
            ) => {
                this.mostrarTextoTurnos(cantidad, personaje, accion, objetivo);
            }
        );

        // Resetea el contenedor de texto
        this.events.on("clean_text", () => {
            const listaHijos = this.contenedorTexto.getAll();
            if (listaHijos.length > 1) {
                for (let i = 1; i < listaHijos.length; i++) {
                    listaHijos[i].destroy();
                }
                this.contenedorTexto.removeBetween(1);
            }
        });

        // Otro tipo de mensajes 
        this.events.on("extra_text", (text: string) => {
            let textoProcesado = `[color=yellow]${text}[/color]`;
            let mensaje = this.rexUI.add.BBCodeText(
                0 - width * 0.2,
                height / 2,
                textoProcesado,
                {
                    fontFamily: "MiFuente",
                    fontSize: "64px",
                    color: "#ffffff",
                }
            );
            mensaje.setOrigin(0.5, 0.5);

            this.tweens.add({
                targets: mensaje,
                x: width / 2,
                duration: 1000,
                ease: "Power2",
            });

            setTimeout(() => {
                this.tweens.add({
                    targets: mensaje,
                    x: width * 2,
                    duration: 1000,
                    ease: "Power2",
                    onComplete: () => {
                        mensaje.destroy();
                    },
                });
            }, 1000);
        });
    }

    // Funciones **********************************************

    // Inventario --------------------

    crearInventario(x: number, y: number) {
        // Si el jugador no tiene inventario no crea el inventario
        if (this.inventarioJugadorMax <= 0) return;

        const modoScroll = 0;

        const invWidth = 800;
        const invHeight = 500;

        const columnas = 5;
        const filas = Math.ceil(this.inventarioJugadorMax / columnas);
        const anchoCelda = 150;
        const alturaCelda = 150;

        const anchoTotalTabla = columnas * anchoCelda;
        const alturaTotalTabla = filas * alturaCelda;

        // Padding si hay más de dos filas
        const padding = 20;

        // Otros elemnetos
        let cabeceraInventario = this.crearHeaderInventario(invWidth, invHeight);

        // Inventario
        this.inventario = this.rexUI.add
            .gridTable({
                x,
                y,
                width: invWidth,
                height: invHeight,
                background: this.add.image(0.5, 0.5, "inventarioFondo"),

                scrollMode: modoScroll,

                table: {
                    cellWidth: anchoCelda,
                    cellHeight: alturaCelda,
                    columns: columnas,
                },

                // Centra la tabla
                space: {
                    left: Math.max((invWidth - anchoTotalTabla) / 2, 0),
                    right: Math.max((invWidth - anchoTotalTabla) / 2, 0),
                    top: padding,
                    bottom: padding,
                    header: 100,
                },

                mouseWheelScroller: {
                    focus: false,
                    speed: 0.1,
                },

                items: new Array(this.inventarioJugadorMax).fill(null),

                //https://codepen.io/rexrainbow/pen/pooZWme?editors=0010
                header: cabeceraInventario,

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
                        ancho = cell.width,
                        alto = cell.height,
                        index = cell.index;

                    const item = scene.arrayInventario[index];

                    if (cellContainer === null) {
                        cellContainer = scene.add.container(0, 0);

                        const imagenSlot = scene.add
                            .image(0, 0, "inventarioSlot")
                            .setDisplaySize(ancho * 0.8, alto * 0.8)
                            .setOrigin(0.5);

                        imagenSlot.setPosition(ancho * 0.5, alto * 0.5);
                        imagenSlot.name = "slotBackground";
                        cellContainer?.add(imagenSlot);

                        if (item) {
                            const imagenItem = scene.add
                                .sprite(0, 0, "recursos", item.imagen)
                                .setDisplaySize(ancho * 0.6, alto * 0.6)
                                .setOrigin(0.5);

                            imagenItem.setPosition(ancho * 0.5, alto * 0.5);
                            imagenItem.name = "itemImage";
                            cellContainer?.add(imagenItem);

                            const textoItem = scene.rexUI.add.BBCodeText(
                                ancho - 50,
                                alto / 1.5,
                                item.cantidad,
                                {
                                    fontFamily: "MiFuente",
                                    fontSize: "32px",
                                    color: "#000000",
                                }
                            );
                            textoItem.name = "itemText";
                            cellContainer?.add(textoItem);

                            // Añade un overlay sobre la escena
                            const clickOverlay = scene.add.rectangle(
                                ancho * 0.5,
                                alto * 0.5,
                                ancho,
                                alto,
                                0x000000,
                                0
                            );
                            clickOverlay.setInteractive();
                            clickOverlay.setDepth(10);
                            clickOverlay.name = "clickOverlay";

                            clickOverlay.on("pointerdown", () => {
                                scene.batallaEscena.events.emit("use-item", item);

                                // Obtiene el texto del item para actualizar la cantidad
                                let textoHijoItem = cellContainer?.list.find(
                                    (child) => child.name === "itemText"
                                );

                                textoHijoItem.setText(item.cantidad.toString());

                                scene.alternarInventario();
                                scene.invBTN.setFrame(4);
                            });

                            cellContainer?.add(clickOverlay);
                        }
                    }

                    return cellContainer;
                },
            })
            .layout();

        this.inventario.setVisible(false);
    }

    crearHeaderInventario(anchura: number, altura: number) {
        let backBTN = this.add
            .image(anchura / 2 - 50, 80, "backbutton")
            .setDisplaySize(90, 80)
            .setOrigin(1, 0.9);

        backBTN.setInteractive();

        backBTN.on("pointerdown", () => {
            this.alternarInventario();
            this.invBTN.setFrame(4);
        });

        let cabeceraInventario = this.add.container(0, 0);
        cabeceraInventario.add([backBTN]);
        cabeceraInventario.setDepth(10);

        return cabeceraInventario;
    }

    // Esconde o muestra el inventario
    alternarInventario() {
        if (this.inventario) {
            this.inventario.setVisible(!this.inventario.visible);
            this.invAbierto = !this.invAbierto;

            // Desactiva o activa los botones
            if (this.invAbierto) {
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

    // Textos turno -------------------
    mostrarTextoTurnos(
        cantidad: number,
        personaje: string,
        accion: string,
        objetivo?: string
    ) {
        let textoMensaje = "";

        if (accion === "showTurn") {
            textoMensaje = `Turn ${cantidad}`;

            let mensaje = this.rexUI.add.BBCodeText(0, 0, textoMensaje, {
                fontFamily: "MiFuente",
                fontSize: "32px",
                color: "#ffffff",
            });

            this.contenedorTexto.add(mensaje);
            mensaje.setOrigin(0.5, 0.5);

            mensaje.x = 0;
            mensaje.y = 25;

            return;
        }

        if (accion === "attack") {
            if (personaje == "player") {
                textoMensaje += `The [color=green]${personaje}[/color] `;
            } else {
                textoMensaje += `The [color=red]${personaje}[/color] `;
            }

            textoMensaje += `has dealt  [color=yellow]${cantidad} damage[/color]  `;

            if (objetivo == "player") {
                textoMensaje += `to [color=green]${objetivo}[/color] `;
            } else {
                textoMensaje += `to [color=red]${objetivo}[/color] `;
            }
        } else if (accion === "heal") {
            if (personaje == "player") {
                textoMensaje += `The [color=green]${personaje}[/color] `;
            } else {
                textoMensaje += `The [color=red]${personaje}[/color] `;
            }

            textoMensaje += `has recovered  [color=yellow]${cantidad} health[/color]  `;
        } else if (accion === "miss") {
            if (personaje == "player") {
                textoMensaje += `The [color=green]${personaje}[/color] `;
            } else {
                textoMensaje += `The [color=red]${personaje}[/color] `;
            }

            textoMensaje += `has missed an attack`;
        }

        let mensaje = this.rexUI.add.BBCodeText(0, 0, textoMensaje, {
            fontFamily: "MiFuente",
            fontSize: "24px",
            color: "#ffffff",
        });

        // Añade el texto al contenedor y lo centra
        this.contenedorTexto.add(mensaje);
        mensaje.setOrigin(0.5, 0.5);

        let totalMessages = this.contenedorTexto.length - 2;

        mensaje.y = 40 + totalMessages * 40;
    }

    // Barras de vida ------------------
    crearBarraVida(posX: number, posY: number, vida: number, key: string) {
        let nuevaBarraVida = this.rexUI.add
            .numberBar({
                x: posX,
                y: posY + 115,
                width: 300,
                height: 20,
                icon: this.add.sprite(0, 0, "iconos", 0).setScale(2, 2),

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
                text: this.add.text(0, 0, `${vida}HP`, {
                    fontFamily: "MiFuente",
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

        this.add.existing(nuevaBarraVida);
        nuevaBarraVida.setValue(vida, 0, vida);
        this.barrasVida[key] = nuevaBarraVida;
    }

    actualizarBarraVida(cantidad: number, key: string) {
        let barraActualizar = this.barrasVida[key];

        if (barraActualizar) {
            barraActualizar.setValue(cantidad, 0, 100);
            barraActualizar.text = `${cantidad}HP`;

            // Obtiene el slider
            let slider = barraActualizar.getElement
                ? barraActualizar.getElement("slider")
                : null;

            // El indicador que muestra la cantidad actual de vida
            let indicador = slider.getElement
                ? slider.getElement("indicator")
                : null;

            // Si el personaje no tiene vida muestra una barra vacía
            if (cantidad <= 0) {
                indicador.setVisible(false);
            } else {
                indicador.setVisible(true);
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
