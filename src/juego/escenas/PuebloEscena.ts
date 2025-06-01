import { GameObjects } from "phaser";
import { Assets } from "../../compartido/Assets";
import { IObjetoInteractuable } from "../../Interfaces/IObjetoInteractuable";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import {
    ElementoListaPersonajesDTO,
    PersonajeDTO,
} from "../../DTOs/PersonajeDTO";

export default class PuebloEscena extends Phaser.Scene {
    rexUI: RexUIPlugin;

    fondo: GameObjects.Image;

    // Mapa
    suelo: GameObjects.Image;

    // Jugador
    jugador!: GameObjects.Sprite;

    ultimaPosicionJugador: number;
    listaPersonajes: ElementoListaPersonajesDTO[] = [];
    personajeSeleccionado: PersonajeDTO = new PersonajeDTO();
    todosPersonajesUsuario: PersonajeDTO[] = [];

    // Objetos interactuables
    teletransporte!: GameObjects.Sprite;

    contenedorTexto: GameObjects.Container;

    menuSeleccionPersonajes: any;

    // Teclado
    cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
    teclaA!: Phaser.Input.Keyboard.Key;
    teclaD!: Phaser.Input.Keyboard.Key;
    teclaE!: Phaser.Input.Keyboard.Key;

    // Variables -----------------
    mirarDerecha: boolean = true;

    puedeMoverse: boolean = true;

    // Distancias con objetos interactuables
    objetosInteractuables: IObjetoInteractuable[] = [];

    constructor() {
        super("PuebloEscena");
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
    }

    preload() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.load.image("fondo", Assets.fondoBosque_sprite);

        this.load.aseprite(
            "jugador",
            this.personajeSeleccionado.spriteURL,
            this.personajeSeleccionado.jsonURL
        );

        this.load.image("suelo", Assets.sueloPueblo);
        this.load.image("casaHerrero", Assets.casaHerrero);
        this.load.image("casaPrincipal", Assets.casaPrincipal);
        this.load.aseprite("tp", Assets.tp_sprite, Assets.tp_json);
    }

    async create() {
        // Evita que Phaser capture teclas si estás escribiendo
        window.addEventListener(
            "keydown",
            (event) => {
                const tag = document.activeElement?.tagName;

                const estaEscribiendo =
                    tag === "INPUT" ||
                    tag === "TEXTAREA" ||
                    (document.activeElement as HTMLElement)?.isContentEditable;

                if (estaEscribiendo) {
                    // Detener propagación a Phaser
                    event.stopPropagation();
                }
            },
            // Usa `capture: true` para interceptarlo antes de Phaser
            true
        );

        const { width, height } = this.scale;

        this.menuSeleccionPersonajes = this.generarPanelSeleccionPersonaje();
        this.add.existing(this.menuSeleccionPersonajes);
        this.menuSeleccionPersonajes.setPosition(
            this.scale.width / 2,
            this.scale.height / 2
        );
        this.menuSeleccionPersonajes.setVisible(true);

        // Fondo
        this.fondo = this.add.sprite(0, 0, "fondo");
        this.fondo.setOrigin(0, 0);
        this.fondo.setDisplaySize(width, height);
        this.fondo.setScrollFactor(0);

        // this.fondo = this.add
        //     .tileSprite(0, 0, width, height, "fondo")
        //     .setOrigin(0, 0);
        // this.fondo.setScrollFactor(0); // No se mueve con la cámara

        // Mapa
        this.suelo = this.add.sprite(0, height / 2.7, "suelo");
        this.suelo.setOrigin(0, 0);
        this.suelo.setScale(4, 4);

        let casaHerrero = this.add.sprite(
            (this.suelo.scaleX * this.suelo.width) / 1.57,
            height / 3.8,
            "casaHerrero"
        );
        casaHerrero.setOrigin(0, 0);
        casaHerrero.setScale(4, 4);

        let casaPrincipal = this.add.sprite(
            (this.suelo.scaleX * this.suelo.width) / 4,
            height / 1.65,
            "casaPrincipal"
        );
        casaPrincipal.setOrigin(0.5, 0.5);
        casaPrincipal.setScale(4, 4);

        this.generarAnimacion("tp");
        this.teletransporte = this.add.sprite(
            (this.suelo.scaleX * this.suelo.width) / 1.15,
            height / 1.47,
            "tp",
            0
        );
        this.teletransporte.setOrigin(0.5, 0.5);
        this.teletransporte.setScale(4, 4);
        this.teletransporte.anims.timeScale = 0.3;
        this.teletransporte.play({ key: "tp_Animacion_defecto", repeat: -1 });

        // Jugador
        // this.anims.createFromAseprite("jugador");
        await this.generarAnimacion("jugador");

        this.jugador = this.add.sprite(width / 3.5, height / 1.3, "jugador", 0);
        this.jugador.setOrigin(0.5, 0.5);
        this.jugador.setScale(4, 4);

        // Animaciones del jugador, animaciones intercaladas para mayor fluidéz
        this.jugador.on(
            "animationcomplete",
            (anim: Phaser.Animations.Animation) => {
                if (anim.key === "jugador_TC_izq") {
                    this.jugador.play({ key: "jugador_Cam_izq", repeat: -1 });
                } else if (anim.key === "jugador_TC_derch") {
                    this.jugador.play({ key: "jugador_Cam_derch", repeat: -1 });
                }
            }
        );

        this.cursor = this.input.keyboard!.createCursorKeys();
        this.teclaA = this.input.keyboard!.addKey("A");
        this.teclaD = this.input.keyboard!.addKey("D");
        this.teclaE = this.input.keyboard!.addKey("E");

        // Cámara
        this.cameras.main.startFollow(this.jugador);
        this.cameras.main.setBounds(
            0,
            0,
            this.suelo.width * this.suelo.scaleX,
            600
        ); // límites de la cámara si tu fondo es más grande que el canvas

        // ----------------------------------------------------------
        // Lista de objetos interactuables
        this.objetosInteractuables = [
            {
                nombre: "teletransporte",
                sprite: this.teletransporte,
                distanciaMaxima: 250,
            },
            {
                nombre: "casa",
                sprite: casaPrincipal,
                distanciaMaxima: 400,
            },
        ];

        // ----------------------------------------------------------

        // Texto del boton para interactuar
        const textoInteractuar = this.add
            .text(0, 0, "E", {
                fontFamily: "MiFuente",
                fontSize: "96px",
                color: "#000000",
            })
            .setOrigin(0.5);

        // Obtener tamaño del texto
        const bounds = textoInteractuar.getBounds();
        const padding = 20;
        const borderRadius = 15;

        // Crear fondo con coordenadas relativas al texto (centrado en 0,0)
        const bg = this.add.graphics();
        bg.fillStyle(0xffffff, 1);
        bg.fillRoundedRect(
            -bounds.width / 2 - padding,
            -bounds.height / 2 - padding,
            bounds.width + padding * 2,
            bounds.height + padding * 2,
            borderRadius
        );

        // Crear contenedor en pantalla
        this.contenedorTexto = this.add.container(width / 2, height / 2, [
            bg,
            textoInteractuar,
        ]);
        this.contenedorTexto.setSize(
            bounds.width + padding * 2,
            bounds.height + padding * 2
        );
        this.contenedorTexto.setVisible(false);
    }

    update(): void {
        // Si no se ha iniciado el jugador no hace el update
        if (!this.jugador) return;

        // Ajusta la velocidad del jugador
        const velocidad = 6;

        if (this.puedeMoverse) {
            let anchoSuelo = this.suelo.width * this.suelo.scaleX;
            let animacionActual = this.jugador.anims.currentAnim?.key;

            // Establece una animación
            if (this.cursor.left.isDown || this.teclaA.isDown) {
                this.jugador.x -= velocidad;

                // Ejecuta la animación
                if (
                    animacionActual !== "jugador_Cam_izq" &&
                    animacionActual !== "jugador_TC_izq"
                ) {
                    this.jugador.anims.timeScale = 0.9;
                    this.jugador.play({ key: "jugador_TC_izq" });
                }

                this.mirarDerecha = false;
            } else if (this.cursor.right.isDown || this.teclaD.isDown) {
                this.jugador.x += velocidad;

                // Ejecuta la animación
                if (
                    animacionActual !== "jugador_Cam_derch" &&
                    animacionActual !== "jugador_TC_derch"
                ) {
                    this.jugador.anims.timeScale = 0.9;
                    this.jugador.play({ key: "jugador_TC_derch" });
                }

                this.mirarDerecha = true;
            } else {
                if (
                    animacionActual !== "jugador_Idle_derch" &&
                    animacionActual !== "jugador_Idle_izq"
                ) {
                    this.jugador.anims.timeScale = 0.3;

                    // Ejecuta la animación
                    if (this.mirarDerecha) {
                        this.jugador.play({
                            key: "jugador_Idle_derch",
                            repeat: -1,
                        });
                    } else {
                        this.jugador.play({
                            key: "jugador_Idle_izq",
                            repeat: -1,
                        });
                    }
                }
            }

            //Limita cuanto se puede mover el personaje en función de la longitud del suelo
            if (this.jugador.x <= 25) {
                this.jugador.x = 26;
                return;
            }

            if (this.jugador.x >= anchoSuelo - 25) {
                this.jugador.x = anchoSuelo - 26;
                return;
            }
        }

        // this.ultimaPosicionJugador = this.jugador.x;

        // // Si el jugador se ha movido calcula las distancias
        // if (this.ultimaPosicionJugador != this.jugador.x) {
        this.mostrarTextoInteraccion();
        // }
    }

    mostrarTextoInteraccion() {
        let objetoCercano = null;

        for (let obj of this.objetosInteractuables) {
            const distancia = Phaser.Math.Distance.BetweenPoints(
                this.jugador,
                obj.sprite
            );

            if (distancia < obj.distanciaMaxima) {
                objetoCercano = obj;
                break;
            }
        }

        if (objetoCercano) {
            this.contenedorTexto.setVisible(true);
            this.contenedorTexto.setPosition(
                this.jugador.x,
                this.jugador.y - 190
            );

            //TODO mejorar la lógica
            if (this.teclaE.isDown) {
                if (objetoCercano.nombre == "teletransporte") {
                    this.tp_siguienteNivel();
                }
            }
        } else {
            this.contenedorTexto.setVisible(false);
        }
    }

    generarPanelSeleccionPersonaje() {
        return this.rexUI.add.scrollablePanel({
            width: 500,
            height: 400,
            scrollMode: 0, // vertical

            panel: {
                child: this.createCharacterList(),
                mask: { padding: 1 },
            },

            slider: {
                track: this.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    10,
                    10,
                    0x555555
                ),
                thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0xaaaaaa),
            },

            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                panel: 10,
            },
        });
    }

    createCharacterList() {
        const sizer = this.rexUI.add.fixWidthSizer({
            space: {
                item: 10,
                line: 10,
            },
            align: "left",
        });

        const dummy = this.add.text(0, 0, "Panel visible", {
            fontSize: "20px",
            color: "#fff",
        });

        sizer.add(dummy);

        return sizer;
    }

    createPersonajeItem(personaje: PersonajeDTO) {
        return this.rexUI.add
            .label({
                width: 450,
                height: 60,
                background: this.rexUI.add.roundRectangle(
                    0,
                    0,
                    0,
                    0,
                    10,
                    0x333333
                ),

                icon: this.add
                    .image(0, 0, personaje.spriteURL)
                    .setDisplaySize(48, 48),

                text: this.add.text(0, 0, `${personaje.nombre} (Lvl 1)`, {
                    fontSize: "18px",
                    color: "#ffffff",
                }),

                space: {
                    icon: 10,
                    left: 15,
                    right: 15,
                    top: 10,
                    bottom: 10,
                },

                align: "center",
            })
            .setInteractive()
            .on("pointerup", () => {});
    }

    // Genera animaciones individuales para cada elemento que las necesite y así evitar conflictos
    async generarAnimacion(elemento: string) {
        const animaciones = this.anims.createFromAseprite(elemento);
        animaciones.forEach((animacion) => {
            const nuevaKey = `${elemento}_${animacion.key}`;

            this.anims.remove(animacion.key); // Opcional: limpia si ya existía

            this.anims.create({
                key: nuevaKey,
                frames: animacion.frames.map((f) => ({
                    key: f.textureKey,
                    frame: f.frame.name,
                    duration: f.duration,
                })),
                frameRate: animacion.frameRate,
                repeat: animacion.repeat,
            });
        });
    }

    calcularDuracionAnimacion(nombre: string) {
        const animacion = this.anims.get(nombre);

        let numeroFrames = animacion.frames.length;
        let frameRate = animacion.frameRate;
        let duracion = (numeroFrames / frameRate) * 1000;

        return duracion;
    }

    // Pasa al siguiente nivel utilizando el teletransporte
    tp_siguienteNivel() {
        this.puedeMoverse = false;

        let duracion = this.calcularDuracionAnimacion("tp_Animacion_tp");

        // Hace la animación de teletransporte
        this.teletransporte.anims.timeScale = 1;
        this.teletransporte.anims.play({
            key: "tp_Animacion_tp",
        });

        this.jugador.anims.timeScale = 0.3;
        // Ejecuta la animación
        if (this.mirarDerecha) {
            this.jugador.play({
                key: "jugador_Idle_derch",
                repeat: -1,
            });
        } else {
            this.jugador.play({
                key: "jugador_Idle_izq",
                repeat: -1,
            });
        }

        this.cameras.main.fadeOut(duracion, 0, 0, 0);

        // Cuando completa la animación cambia de pantalla
        this.teletransporte.on("animationcomplete", () => {
            this.scene.stop("PuebloEscena");
            this.destroy();
            this.scene.start("EscenaBatalla");
        });
    }

    destroy() {
        this.events.removeAllListeners();
        this.children.removeAll(true);
    }
}
