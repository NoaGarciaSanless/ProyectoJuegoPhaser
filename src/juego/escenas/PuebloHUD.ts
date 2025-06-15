import { Assets } from "../../compartido/Assets";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import { GameObjects } from "phaser";

import {
    ElementoListaPersonajesDTO,
    PersonajeDTO,
} from "../../DTOs/PersonajeDTO";

import { seleccionarPersonaje } from "../../Servicios/DatosAssetsServicio";
import PuebloEscena from "./PuebloEscena";
import { inputState, interactuar } from "../Modulos/modulo_movimiento";

export default class PuebloHUD extends Phaser.Scene {
    rexUI: RexUIPlugin;

    puebloEscena: PuebloEscena | any;

    listaPersonajes: ElementoListaPersonajesDTO[] = [];
    personajeSeleccionado: PersonajeDTO = new PersonajeDTO();
    todosPersonajesUsuario: PersonajeDTO[] = [];

    menuSeleccionPersonajes: any;

    boton_izq: GameObjects.Sprite;
    boton_derch: GameObjects.Sprite;
    boton_interaccion: GameObjects.Sprite;

    constructor() {
        super({ key: "PuebloHUD", active: false, visible: true });
    }

    // Establece los valores obtenidos para la lista de personajes
    init(data: {
        listaPersonajes: ElementoListaPersonajesDTO[];
        personajeSeleccionado: PersonajeDTO;
        todosPersonajesUsuario: PersonajeDTO[];
    }) {
        this.listaPersonajes = data.listaPersonajes;
        this.personajeSeleccionado = data.personajeSeleccionado;
        this.todosPersonajesUsuario = data.todosPersonajesUsuario;

        interactuar.hud.interaccion_e = false;
        inputState.hud.izquierda = false;
        inputState.hud.derecha = false;
    }

    preload() {
        this.load.image("fondoInventarios", Assets.fondoInventario_sprite);
        this.load.image("fondoSlot", Assets.fondoSlot_sprite);

        this.load.image("botonVolver", Assets.flechaVolver_sprite);
        this.load.aseprite(
            "botonSeleccionar",
            Assets.seleccionarBTN_sprite,
            Assets.seleccionarBTN_json
        );
        this.load.aseprite(
            "botones_pueblo",
            Assets.botones_pueblo_sprite,
            Assets.botones_pueblo_json
        );

        // Agrega un manejador para errores de carga
        this.load.on("loaderror", (file: Phaser.Loader.File) => {
            console.error(`Error al cargar el archivo: ${file.key}`);
        });
    }

    create() {
        this.puebloEscena = this.scene.get("PuebloEscena") as PuebloEscena;

        this.crearBotonesPueblo(this.scale.width, this.scale.height);

        this.menuSeleccionPersonajes = this.generarPanelSeleccionPersonaje();
        // this.add.existing(this.menuSeleccionPersonajes);
        this.menuSeleccionPersonajes.setPosition(
            this.scale.width / 2,
            this.scale.height / 2
        );
        this.menuSeleccionPersonajes.setVisible(false);

        this.events.on("mostrar-panel", () => {
            this.menuSeleccionPersonajes.setVisible(true);
        });
    }

    crearBotonesPueblo(width: number, height: number) {
        this.boton_izq = this.add
            .sprite(width * 0.1, height * 0.9, "botones_pueblo", 0)
            .setOrigin(0.5, 0.5)
            .setScale(3, 3)
            .setAlpha(0.6)
            .setInteractive();

        this.boton_izq.on("pointerdown", () => {
            inputState.hud.izquierda = true;
            this.boton_izq.setAlpha(0.8).setTint(0xa3ea4f);
        });
        this.boton_izq.on("pointerup", () => {
            inputState.hud.izquierda = false;
            this.boton_izq.setAlpha(0.6).clearTint();
        });

        this.boton_derch = this.add
            .sprite(width * 0.2, height * 0.9, "botones_pueblo", 1)
            .setOrigin(0.5, 0.5)
            .setScale(3, 3)
            .setAlpha(0.6)
            .setInteractive();

        this.boton_derch.on("pointerdown", () => {
            inputState.hud.derecha = true;
            this.boton_derch.setAlpha(0.8).setTint(0xa3ea4f);
        });
        this.boton_derch.on("pointerup", () => {
            inputState.hud.derecha = false;
            this.boton_derch.setAlpha(0.6).clearTint();
        });

        this.boton_interaccion = this.add
            .sprite(width * 0.9, height * 0.9, "botones_pueblo", 2)
            .setOrigin(0.5, 0.5)
            .setScale(3, 3)
            .setAlpha(0.6)
            .setInteractive();

        this.boton_interaccion.on("pointerdown", () => {
            interactuar.hud.interaccion_e = true;
            this.boton_interaccion.setAlpha(0.8).setTint(0xa3ea4f);
        });
        this.boton_interaccion.on("pointerup", () => {
            interactuar.hud.interaccion_e = false;
            this.boton_interaccion.setAlpha(0.6).clearTint();
        });
    }

    crearHeaderMenu(anchura: number, altura: number) {
        let texto = this.add
            .text(-anchura * 0.45, 40, `Selección de personaje`, {
                fontFamily: "MiFuente",
                fontSize: "30px",
                color: "#000000",
            })
            .setOrigin(0, 0);

        let backBTN = this.add
            .image(anchura / 2 - 50, 80, "botonVolver")
            .setDisplaySize(90, 80)
            .setOrigin(1, 0.9);

        backBTN.setInteractive();

        backBTN.on("pointerdown", () => {
            this.menuSeleccionPersonajes.setVisible(false);
            this.puebloEscena.events.emit("permitir-movimiento");
        });

        backBTN.on("pointerover", () => {
            backBTN.setTint(0xcccccc);
        });

        backBTN.on("pointerout", () => {
            backBTN.clearTint();
        });

        let cabeceraInventario = this.add.container(0, 0);
        cabeceraInventario.add([texto, backBTN]);
        cabeceraInventario.setDepth(10);

        return cabeceraInventario;
    }

    generarPanelSeleccionPersonaje() {
        const { width, height } = this.scale;

        const modoScroll = 0;

        // Propiedades de cada elemento en el menu
        const columnas = 1;
        const filas = this.todosPersonajesUsuario.length;
        const anchoCelda = 900;
        const alturaCelda = 350;

        const padding = 20;

        // Tamaño del contenedor principal
        const modalWidth = 1000;
        const modalHeight = Math.max(500, filas * alturaCelda + padding * 2);

        const anchoTotalTabla = columnas * anchoCelda;
        const alturaTotalTabla = filas * alturaCelda;

        let cabeceraInventario = this.crearHeaderMenu(modalWidth, modalHeight);

        const gridTable = this.rexUI.add
            .gridTable({
                x: width / 2,
                y: height / 2,
                width: modalWidth,
                height: modalHeight,
                background: this.add.image(0.5, 0.5, "fondoInventarios"),
                scrollMode: modoScroll,
                table: {
                    cellWidth: anchoCelda,
                    cellHeight: alturaCelda,
                    columns: columnas,
                },
                space: {
                    left: Math.max((modalWidth - anchoTotalTabla) / 2, 0),
                    right: Math.max((modalWidth - anchoTotalTabla) / 2, 0),
                    top: padding,
                    bottom: padding,
                    header: 100,
                },
                mouseWheelScroller: {
                    focus: false,
                    speed: 0.1,
                },
                items: this.todosPersonajesUsuario,
                header: cabeceraInventario,
                createCellContainerCallback: function (
                    cell: {
                        index: any;
                        scene: any;
                        width: number;
                        height: number;
                    },
                    cellContainer: any
                ) {
                    const scene = cell.scene,
                        ancho = cell.width,
                        alto = cell.height,
                        index = cell.index;

                    const personaje: PersonajeDTO =
                        scene.todosPersonajesUsuario[index];
                    const estadisticas: ElementoListaPersonajesDTO =
                        scene.listaPersonajes.find(
                            (elemento: ElementoListaPersonajesDTO) =>
                                personaje.id == `${elemento.personajeID}`
                        );

                    if (!cellContainer) {
                        cellContainer = scene.add.container(0, 0);

                        const padding = 10;
                        const anchuraElemento = ancho;
                        const alturaElemento = alto - 2 * padding;

                        const fondo = scene.add
                            .image(ancho / 2, alto / 2, "fondoSlot")
                            .setOrigin(0.5, 0.5)
                            .setDisplaySize(anchuraElemento, alturaElemento);

                        cellContainer?.add(fondo);

                        const nombre = scene.add
                            .text(
                                ancho * 0.08,
                                alto * 0.11,
                                `${personaje.nombre}`,
                                {
                                    fontFamily: "MiFuente",
                                    fontSize: "40px",
                                    color: "#000000",
                                }
                            )
                            .setOrigin(0, 0);
                        cellContainer?.add(nombre);

                        let caracteristicas = [
                            {
                                label: "Vida",
                                value:
                                    personaje.vidaBase +
                                        personaje.vidaPorNivel *
                                            estadisticas.nivel || 0,
                            },
                            {
                                label: "Ataque",
                                value:
                                    personaje.ataqueBase +
                                        personaje.ataquePorNivel *
                                            estadisticas.nivel || 0,
                            },
                            {
                                label: "Defensa",
                                value:
                                    personaje.defensaBase +
                                        personaje.defensaPorNivel *
                                            estadisticas.nivel || 0,
                            },
                            {
                                label: "Ataque mágico",
                                value:
                                    personaje.ataqueMagicoBase +
                                        personaje.ataqueMagicoPorNivel *
                                            estadisticas.nivel || 0,
                            },
                            {
                                label: "Precisión",
                                value: personaje.precisionBase,
                            },
                            {
                                label: "Crítico",
                                value: personaje.criticoBase,
                            },
                        ];

                        const charYStart = alto * 0.3; // Starting Y position for characteristics
                        const charSpacing =
                            (alto * 0.6) / caracteristicas.length; // Evenly space 5 characteristics

                        caracteristicas.forEach((char, i) => {
                            const charText = scene.add
                                .text(
                                    ancho * 0.1,
                                    charYStart + i * charSpacing,
                                    `${char.label}: ${char.value}`,
                                    {
                                        fontFamily: "MiFuente",
                                        fontSize: "30px",
                                        color: "#000000",
                                    }
                                )
                                .setOrigin(0, 0.5);
                            cellContainer!.add(charText);
                        });

                        // Boton de seleccionar
                        const button = scene.add
                            .sprite(
                                ancho * 0.8,
                                alto * 0.8,
                                "botonSeleccionar",
                                0
                            )
                            .setOrigin(0.5, 0.5)
                            .setScale(1.5, 1.5)
                            .setInteractive();

                        // Add button click event
                        button.on("pointerdown", async () => {
                            console.log(
                                `Selected character: ${personaje.nombre}`
                            );
                            button.setFrame(1);
                            scene.puebloEscena.events.emit(
                                "permitir-movimiento"
                            );

                            try {
                                await seleccionarPersonaje(
                                    Number.parseInt(
                                        scene.personajeSeleccionado.id
                                    ),
                                    Number.parseInt(personaje.id)
                                );

                                // Recarga la escena
                                this.scene.stop("PuebloHUD");
                                this.scene.stop("PuebloEscena");
                                this.scene.start("CargaEscena");
                            } catch (error) {
                                console.log("Ha ocurrido un error: " + error);
                            }
                        });

                        button.on("pointerup", () => {
                            button.setFrame(0);
                        });

                        cellContainer!.add(button);
                    }

                    return cellContainer;
                }.bind(this),
            })
            .layout();

        return gridTable;
    }
}
