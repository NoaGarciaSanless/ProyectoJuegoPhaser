import { GameObjects } from "phaser";

import Phaser from "phaser";
import BatallaEscena from "./BatallaEscena";

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
    invAbierto = false;

    // Otras escenas
    batallaEscena: BatallaEscena;

    // Variables
    puedeAtacar: boolean = true;

    constructor() {
        super({ key: "BatallaHUD", active: false, visible: true });
    }

    preload() {
        this.cameras.main.fadeIn(2500, 0, 0, 0);

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
        this.batallaEscena = this.scene.get("EscenaBatalla") as BatallaEscena;

        // Crea el contenedor de texto
        this.crearContenedorTexto(width);

        // Crea los botones
        this.crearBotones(width, height);

        // Inicializa el inventario
        this.inicializarInventario(width, height);

        // Configura los eventos
        this.configurarEventos();
    }

    // Funciones **********************************************

    // Métodos de creación
    private crearContenedorTexto(width: number) {
        this.contenedorTexto = this.add.container(width / 2, 0);
        const bgWidth = width / 2;
        const bgHeight = 150;

        const bg = this.add
            .graphics()
            .fillStyle(0x000000, 0.75)
            .fillRect(-bgWidth / 2, 20, bgWidth, bgHeight);

        this.contenedorTexto.add(bg);
    }

    private crearBotones(width: number, height: number) {
        this.contenedorBotones = this.add.container(width / 2, height - 100);

        this.atkBTN = this.crearBoton(
            0,
            0,
            "botones",
            0,
            width / 10,
            height / 10
        );
        this.defBTN = this.crearBoton(
            0,
            0,
            "botones",
            2,
            width / 10,
            height / 10
        );
        this.invBTN = this.crearBoton(
            0,
            0,
            "botones",
            4,
            width / 10,
            height / 10
        );

        const btnList = [this.atkBTN, this.defBTN, this.invBTN];
        this.contenedorBotones.add(btnList);
        this.distribuirElementos(btnList, width);
    }

    private crearBoton(
        x: number,
        y: number,
        texture: string,
        frame: number,
        width: number,
        height: number
    ): GameObjects.Sprite {
        return this.add
            .sprite(x, y, texture, frame)
            .setOrigin(0.5)
            .setDisplaySize(width, height)
            .setInteractive();
    }

    // Función para distribuir los botones en el contenedor de botones
    private distribuirElementos(
        botones: GameObjects.Sprite[],
        anchoContenedor: number
    ) {
        const espaciado = 20;
        const anchoTotal = botones.reduce(
            (acc, boton) => acc + boton.displayWidth,
            0
        );
        const espaciadoTotal = espaciado * (botones.length - 1);
        const offsetX = -(anchoContenedor - anchoTotal - espaciadoTotal) / 2;

        botones.forEach((boton, index) => {
            boton.x = offsetX + (boton.displayWidth + espaciado) * index;
        });
    }

    // Inventario --------------------

    private inicializarInventario(width: number, height: number) {
        this.time.delayedCall(50, () => {
            this.inventarioJugadorMax =
                this.batallaEscena.inventarioBatallaJugadorMax;
            this.listaInventario = this.batallaEscena.inventario;
            this.arrayInventario = Object.values(this.listaInventario);
            this.crearInventario(width / 2, height / 2);
        });
    }

    crearInventario(x: number, y: number) {
        // Si el jugador no tiene inventario no crea el inventario
        if (this.inventarioJugadorMax <= 0) return;

        const invWidth = 800;
        const invHeight = 500;
        const columnas = 5;
        const filas = Math.ceil(this.inventarioJugadorMax / columnas);
        const anchoCelda = 150;
        const alturaCelda = 150;
        const padding = 20;

        const cabeceraInventario = this.crearHeaderInventario(
            invWidth,
            invHeight
        );

        this.inventario = this.rexUI.add
            .gridTable({
                x,
                y,
                width: invWidth,
                height: invHeight,
                background: this.add.image(0.5, 0.5, "inventarioFondo"),
                scrollMode: 0,
                table: {
                    cellWidth: anchoCelda,
                    cellHeight: alturaCelda,
                    columns: columnas,
                },
                space: {
                    left: Math.max((invWidth - columnas * anchoCelda) / 2, 0),
                    right: Math.max((invWidth - columnas * anchoCelda) / 2, 0),
                    top: padding,
                    bottom: padding,
                    header: 100,
                },
                mouseWheelScroller: { focus: false, speed: 0.1 },
                items: new Array(this.inventarioJugadorMax).fill(null),
                header: cabeceraInventario,
                createCellContainerCallback: (
                    cell: {
                        index: number;
                        scene: any;
                        width: number;
                        height: number;
                    },
                    cellContainer
                ) => {
                    const { scene, width: ancho, height: alto, index } = cell;
                    const item = this.arrayInventario[index];

                    if (!cellContainer) {
                        cellContainer = scene.add.container(0, 0);
                        const imagenSlot = scene.add
                            .image(0, 0, "inventarioSlot")
                            .setDisplaySize(ancho * 0.8, alto * 0.8)
                            .setOrigin(0.5)
                            .setPosition(ancho * 0.5, alto * 0.5);
                        imagenSlot.name = "slotBackground";
                        cellContainer!.add(imagenSlot);

                        if (item) {
                            const imagenItem = scene.add
                                .sprite(0, 0, "recursos", item.imagen)
                                .setDisplaySize(ancho * 0.6, alto * 0.6)
                                .setOrigin(0.5)
                                .setPosition(ancho * 0.5, alto * 0.5);
                            imagenItem.name = "itemImage";
                            cellContainer!.add(imagenItem);

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
                            cellContainer!.add(textoItem);

                            const clickOverlay = scene.add
                                .rectangle(
                                    ancho * 0.5,
                                    alto * 0.5,
                                    ancho,
                                    alto,
                                    0x000000,
                                    0
                                )
                                .setInteractive()
                                .setDepth(10)
                                .setName("clickOverlay")
                                .on("pointerdown", () => {
                                    scene.batallaEscena.events.emit(
                                        "use-item",
                                        item
                                    );
                                    const textoHijoItem =
                                        cellContainer!.list.find(
                                            (child: any) =>
                                                child.name === "itemText"
                                        );
                                    textoHijoItem.setText(
                                        item.cantidad.toString()
                                    );
                                    scene.alternarInventario();
                                    scene.invBTN.setFrame(4);
                                });
                            cellContainer!.add(clickOverlay);
                        }
                    }
                    return cellContainer;
                },
            })
            .layout()
            .setVisible(false);
    }

    private crearHeaderInventario(anchura: number, altura: number) {
        const backBTN = this.add
            .image(anchura / 2 - 50, 80, "backbutton")
            .setDisplaySize(90, 80)
            .setOrigin(1, 0.9)
            .setInteractive()
            .on("pointerdown", () => {
                this.alternarInventario();
                this.invBTN.setFrame(4);
            })
            .on("pointerover", () => backBTN.setTint(0xcccccc))
            .on("pointerout", () => backBTN.clearTint());

        const cabeceraInventario = this.add
            .container(0, 0)
            .add(backBTN)
            .setDepth(10);
        return cabeceraInventario;
    }

    // Gestión de eventos
    private configurarEventos() {
        this.atkBTN
            .on("pointerdown", () => {
                if (this.puedeAtacar) {
                    this.atkBTN.setFrame(1);
                    this.batallaEscena.events.emit("personaje-ataque");
                    this.puedeAtacar = false;
                }
            })
            .on("pointerup", () => this.atkBTN.setFrame(0));

        this.invBTN
            .on("pointerdown", () => {
                this.invBTN.setFrame(5);
                this.alternarInventario();
            })
            .on("pointerup", () => this.invBTN.setFrame(4));

        this.events.on("desactivar-botones", () => this.desactivarBotones());
        this.events.on("permitir_ataque", () => (this.puedeAtacar = true));
        this.events.on("cancelar-ataque", () => (this.puedeAtacar = false));
        this.events.on(
            "crear_barra_vida",
            (posX: number, posY: number, health: number, key: string) => {
                this.crearBarraVida(posX, posY, health, key);
            }
        );
        this.events.on(
            "actualizar_barra_vida",
            (quantity: number, key: string) => {
                this.actualizarBarraVida(quantity, key);
            }
        );
        this.events.on(
            "texto_nivel",
            (posX: number, posY: number, nivelPersonaje: number) => {
                this.crearTextoNivel(posX, posY, nivelPersonaje);
            }
        );

        this.events.on("game_over", () =>
            this.mostrarMensajeFinal("Game Over!", this.scale.width / 3.5)
        );
        this.events.on("victory", () =>
            this.mostrarMensajeFinal("Victory!", this.scale.width / 3)
        );
        this.events.on(
            "mostrar_texto_log",
            (
                cantidad: number,
                personaje: string,
                accion: string,
                objetivo?: string
            ) => {
                this.mostrarTextoTurnos(cantidad, personaje, accion, objetivo);
            }
        );
        this.events.on("limpiar_texto", () => this.limpiarTexto());
        this.events.on("texto_extra", (text: string) =>
            this.mostrarMensajeExtra(text)
        );
    }

    // Textos turno -------------------
    private mostrarTextoTurnos(
        cantidad: number,
        personaje: string,
        accion: string,
        objetivo?: string
    ) {
        if (accion === "mostrarLog") {
            const mensaje = this.rexUI.add
                .BBCodeText(0, 25, `Turno ${cantidad}`, {
                    fontFamily: "MiFuente",
                    fontSize: "32px",
                    color: "#ffffff",
                })
                .setOrigin(0.5);
            this.contenedorTexto.add(mensaje);
            return;
        }

        const colorPersonaje = personaje === "player" ? "green" : "red";
        const colorObjetivo = objetivo === "player" ? "green" : "red";
        let textoMensaje = "";

        if (accion === "ataque") {
            textoMensaje = `El [color=${colorPersonaje}]${personaje}[/color] ha inflingido [color=yellow]${cantidad} de daño[/color] al [color=${colorObjetivo}]${objetivo}[/color]`;
        } else if (accion === "curar") {
            textoMensaje = `El [color=${colorPersonaje}]${personaje}[/color] ha recuperado [color=yellow]${cantidad} de vida[/color]`;
        } else if (accion === "fallo") {
            textoMensaje = `El [color=${colorPersonaje}]${personaje}[/color] ha fallado`;
        }

        const mensaje = this.rexUI.add
            .BBCodeText(
                0,
                80 + (this.contenedorTexto.length - 2) * 40,
                textoMensaje,
                {
                    fontFamily: "MiFuente",
                    fontSize: "24px",
                    color: "#ffffff",
                }
            )
            .setOrigin(0.5);
        this.contenedorTexto.add(mensaje);
    }

    private mostrarMensajeExtra(text: string) {
        const { width, height } = this.scale;
        const mensaje = this.rexUI.add
            .BBCodeText(
                0 - width * 0.2,
                height / 2,
                `[color=yellow]${text}[/color]`,
                {
                    fontFamily: "MiFuente",
                    fontSize: "64px",
                    color: "#ffffff",
                }
            )
            .setOrigin(0.5);

        this.tweens.add({
            targets: mensaje,
            x: width / 2,
            duration: 1000,
            ease: "Power2",
            onComplete: () => {
                this.tweens.add({
                    targets: mensaje,
                    x: width * 2,
                    duration: 1000,
                    ease: "Power2",
                    onComplete: () => mensaje.destroy(),
                });
            },
        });
    }

    private mostrarMensajeFinal(texto: string, xFinal: number) {
        const { width, height } = this.scale;
        const mensaje = this.add.text(width, height / 2, texto, {
            fontFamily: "MiFuente",
            fontSize: "96px",
            color: "#ffffff",
        });

        this.tweens.add({
            targets: mensaje,
            x: xFinal,
            duration: 1000,
            ease: "Power2",
        });
    }

    private limpiarTexto() {
        const listaHijos = this.contenedorTexto.getAll();
        if (listaHijos.length > 1) {
            for (let i = 1; i < listaHijos.length; i++) {
                listaHijos[i].destroy();
            }
            this.contenedorTexto.removeBetween(1);
        }
    }

    // Barras de vida ------------------
    private crearBarraVida(
        posX: number,
        posY: number,
        vida: number,
        key: string
    ) {
        const barra = this.rexUI.add
            .numberBar({
                x: posX,
                y: posY + 115,
                width: 300,
                height: 20,
                icon: this.add.sprite(0, 0, "iconos", 0).setScale(2),
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

        this.add.existing(barra);
        barra.setValue(vida, 0, 100);
        this.barrasVida[key] = barra;
    }

    private actualizarBarraVida(cantidad: number, key: string) {
        const barra = this.barrasVida[key];
        if (barra) {
            barra.setValue(cantidad, 0, 100);
            barra.text = `${cantidad}HP`;
            const slider = barra.getElement?.("slider");
            const indicador = slider?.getElement?.("indicator");
            indicador?.setVisible(cantidad > 0);
        }
    }

    private crearTextoNivel(
        posX: number,
        posY: number,
        nivelPersonaje: number
    ) {
        let contenedorTexto = this.add.container(posX, posY - posY * 0.2);
        const bgWidth = 130;
        const bgHeight = 30;

        const bg = this.add
            .graphics()
            .fillStyle(0x000000, 0.4)
            .fillRect(-bgWidth / 2, 20, bgWidth, bgHeight);

        let texto = this.add.text(
            -bgWidth * 0.25,
            bgHeight * 0.8,
            `Nivel ${nivelPersonaje}`,
            {
                fontFamily: "MiFuente",
                fontSize: "16px",
                color: "#ffffff",
            }
        );

        contenedorTexto.add([bg, texto]);
    }

    private alternarInventario() {
        if (!this.inventario) return;
        this.invAbierto = !this.invAbierto;
        this.inventario.setVisible(this.invAbierto);

        const botones = [this.atkBTN, this.defBTN, this.invBTN];
        botones.forEach((boton) =>
            this.invAbierto
                ? boton.disableInteractive()
                : boton.setInteractive()
        );
    }

    private desactivarBotones() {
        [this.atkBTN, this.defBTN, this.invBTN].forEach((boton) =>
            boton.disableInteractive()
        );
    }

    update() {}

    destroy() {
        this.events.removeAllListeners();
        this.children.removeAll();
        this.textures.destroy();
    }
}
