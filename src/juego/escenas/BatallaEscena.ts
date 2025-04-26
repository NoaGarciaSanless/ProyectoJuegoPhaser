import { GameObjects } from "phaser";

import Phaser from "phaser";
import BatallaHUD from "./BatallaHUD";

import { ObjetoDTO } from "../../DTOs/ObjetoDTO";

// Turnos de la batalla
enum EstadoBatalla {
    TurnoJugador,
    TurnoEnemigo,
    Animacion,
    FinalizarTurno,
    PantallaFin,
}

export default class EscenaBatalla extends Phaser.Scene {
    // Sprites usados en la escena
    fondoBosque: GameObjects.Image;
    suelo: GameObjects.Image;
    personaje: GameObjects.Sprite;
    enemigo1: GameObjects.Sprite;

    // Otras escenas
    batallaHUD: BatallaHUD | undefined;

    // Variables para la lógica de turnos
    estadoActual: EstadoBatalla = EstadoBatalla.TurnoJugador;
    ultimoEstado: EstadoBatalla = this.estadoActual;

    turno: number = 1;

    vidaJugador: number = 100;
    vidaEnemigo: number = 100;

    ataqueBaseJugador: number = 10;
    ataqueBaseEnemigo: number = 10;

    probaCriticoJugador: number = 3;
    probaFallarJugador: number = 3;

    inventarioBatallaJugadorMax: number = 10;

    inventario: Record<string, ObjetoDTO> = {
        pocion_pq: {
            nombre: "Small Potion",
            imagen: "Vida_sml",
            cantidad: 2,
            efecto: () => {
                if (this.inventario["pocion_pq"].cantidad > 0) {
                    this.vidaJugador = Math.min(this.vidaJugador + 20, 100);
                    this.actualizarBarraVida(this.vidaJugador, "player1");
                    this.mostrarTextoTurnos(20, "player", "heal");

                    this.inventario["pocion_pq"].cantidad--;

                    this.estadoActual = EstadoBatalla.FinalizarTurno;
                    this.siguienteTurno();
                }
            },
        },
    };

    // Variables enemigos
    probFallarEnemigo: number = 3;

    constructor() {
        super("EscenaBatalla");
    }

    preload() {
        this.load.image("fondoBosque", "assets/backgrounds/bosque.png");
        this.load.image("suelo", "assets/backgrounds/suelo.png");

        this.load.aseprite(
            "arboles",
            "assets/decoraciones/assetsNaturaleza.png",
            "assets/decoraciones/assetsNaturaleza.json"
        );

        this.load.aseprite(
            "encapuchado",
            "assets/characters/per_anim_phaser.png",
            "assets/characters/per_anim_phaser.json"
        );

        this.load.aseprite(
            "esquleto",
            "assets/enemies/skeleton/Esqueleto-phaser.png",
            "assets/enemies/skeleton/Esqueleto-phaser.json"
        );
    }

    create() {
        const { width, height } = this.scale;

        // Otras escenas
        this.batallaHUD = this.scene.get("BatallaHUD") as BatallaHUD;

        // Frames para los arboles
        const framesArboles = ["Arbol-0", "Arbol-1", "Arbol-2"];

        // Funciones ------------------------------------------

        // Crea un numero aleatorio de arboles
        function crearArbolesAleatorio(this: EscenaBatalla) {
            let numeroArboles = Math.trunc(Math.max(Math.random() * 4));

            let x: number[] = [];

            for (let i = 0; i <= numeroArboles; i++) {
                const frameArbol = Phaser.Math.RND.pick(framesArboles);
                let xPos = Phaser.Math.Between(0, -4.32);

                do {
                    xPos = Phaser.Math.FloatBetween(-4.32, 0);
                } while (x.some((usado) => Math.abs(usado - xPos) < 0.9));

                x.push(xPos);

                this.add
                    .sprite(0, sueloY - 200, "arboles", frameArbol)
                    .setOrigin(xPos, 0.5)
                    .setScale(3, 3);
            }
        }

        // Fondo -----------------------------------------
        this.fondoBosque = this.add.sprite(0, 0, "fondoBosque");

        this.fondoBosque.setOrigin(0, 0);
        this.fondoBosque.setDisplaySize(width, height / 1.5);

        const sueloY = this.fondoBosque.displayHeight;

        this.suelo = this.add.sprite(0, sueloY, "suelo");
        this.suelo.setOrigin(0.1, 0.4);
        this.suelo.setDisplaySize(width * 1.3, (height - sueloY) * 2);

        crearArbolesAleatorio.call(this);

        // Load the HUD in top of this scene
        this.scene.launch("BatallaHUD");

        // Iniziates the turn text
        this.time.delayedCall(50, () => {
            this.mostrarTextoTurnos(this.turno, "turns", "showTurn");
            this.turno++;
        });

        // Personajes -----------------------------------------

        // Esqueletos
        this.anims.createFromAseprite("esquleto");

        this.enemigo1 = this.add
            .sprite(width / 1.5, height / 1.4, "esquleto", 16)
            .setOrigin(0.5, 0.5)
            .setScale(4, 4);

        this.enemigo1.anims.timeScale = 0.3;
        this.enemigo1.play({ key: "Idle_izq", repeat: -1 });

        this.reproducirAnimacionIdle(this.enemigo1, "Idle_izq");

        this.time.delayedCall(50, () => {
            this.crearBarraVida(
                this.enemigo1.x,
                this.enemigo1.y,
                this.vidaEnemigo,
                "enemy1"
            );
        });

        // Personaje
        this.anims.createFromAseprite("encapuchado");

        this.personaje = this.add
            .sprite(width / 3.5, height / 1.4, "encapuchado", 0)
            .setOrigin(0.5, 0.5)
            .setScale(4, 4);

        this.reproducirAnimacionIdle(this.personaje, "Idle_combate");

        this.time.delayedCall(50, () => {
            this.crearBarraVida(
                this.personaje.x,
                this.personaje.y,
                this.vidaJugador,
                "player1"
            );
        });

        // Eventos ---------------------------------------------
        // Personajes eventos....................................

        // Personajes ataque
        this.events.on("character-attack", async () => {
            // If its not the player turn it will not play the animation
            if (this.estadoActual !== EstadoBatalla.TurnoJugador) return;

            // Waits for the player attack
            await this.ataqueJugador();
            this.estadoActual = EstadoBatalla.FinalizarTurno;
            this.siguienteTurno();
        });

        // Usar un objeto
        this.events.on("use-item", (item: ObjetoDTO) => {
            item.efecto();
        });
    }

    // Controla la lógica de los turnos
    async siguienteTurno() {
        if (this.estadoActual === EstadoBatalla.TurnoJugador) {
            // Limpia los textos para el nuevo turno
            this.batallaHUD?.events.emit("clean_text");
            this.mostrarTextoTurnos(this.turno, "turns", "showTurn");
            this.turno++;

            console.log("Player's Turn");

            // Permite al jugador realizar acciones cuando comienza el turno
            this.batallaHUD?.events.emit("allow-attack");

            return;
        } else if (this.estadoActual === EstadoBatalla.TurnoEnemigo) {
            // Espera a que el enemigo ataque
            console.log("Enemy's Turn");
            await this.ataqueEnemigo();

            // Moves to the next turn
            this.estadoActual = EstadoBatalla.FinalizarTurno;
            this.siguienteTurno();
        } else if (this.estadoActual === EstadoBatalla.Animacion) {
            setTimeout(() => {
                console.log("Animations playing");

                // Pasa al siguiente turno
                this.estadoActual = EstadoBatalla.TurnoEnemigo;
                this.siguienteTurno();
            }, 2000);
        } else if (this.estadoActual === EstadoBatalla.FinalizarTurno) {
            if (this.vidaJugador <= 0) {
                console.log("Game Over");

                this.batallaHUD?.events.emit("game_over");
                this.reproducirAnimacion(this.personaje, "Derrota");

                this.estadoActual = EstadoBatalla.PantallaFin;
                this.siguienteTurno();
            } else if (this.vidaEnemigo <= 0) {
                console.log("Victory");

                this.batallaHUD?.events.emit("victory");

                this.estadoActual = EstadoBatalla.PantallaFin;
                this.siguienteTurno();
            } else {
                setTimeout(() => {
                    console.log(
                        `Player:${this.vidaJugador}, Enemy: ${this.vidaEnemigo}`
                    );

                    if (this.ultimoEstado === EstadoBatalla.TurnoJugador) {
                        this.estadoActual = EstadoBatalla.TurnoEnemigo;
                    } else if (
                        this.ultimoEstado === EstadoBatalla.TurnoEnemigo
                    ) {
                        this.estadoActual = EstadoBatalla.TurnoJugador;

                        // setTimeout(
                        //     () => this.battleHUD?.events.emit("clean_text"),
                        //     500
                        // );
                    }
                    this.ultimoEstado = this.estadoActual;

                    // Pasa al siguiente turno
                    this.siguienteTurno();
                }, 1000);
            }

            // Actualiza las barras de vida
            this.actualizarBarraVida(this.vidaJugador, "player1");
            this.actualizarBarraVida(this.vidaEnemigo, "enemy1");
        } else if (this.estadoActual === EstadoBatalla.PantallaFin) {
            return;
        }
    }

    // Muestra el texto en el container de los turnos
    mostrarTextoTurnos(
        cantidad: number,
        personajes: string,
        accion: string,
        objetivo?: string
    ) {
        this.batallaHUD?.events.emit(
            "show_text",
            cantidad,
            personajes,
            accion,
            objetivo
        );
    }

    // Muestra un texto en el medio de la escena
    mostrarMensaje(texto: string) {
        this.batallaHUD?.events.emit("extra_text", texto);
    }

    // Crea la barra de vida en el HUD
    crearBarraVida(posX: number, posY: number, vida: number, key: string) {
        this.batallaHUD?.events.emit(
            "create_health_bar",
            posX,
            posY,
            vida,
            key
        );
    }

    // Actualiza la barra de vida
    actualizarBarraVida(cantidad: number, key: string) {
        this.batallaHUD?.events.emit("update_health_bar", cantidad, key);
    }

    // Logica para el ataque del personaje
    ataqueJugador(): Promise<void> {
        return new Promise(async (resolve) => {
            await this.reproducirAnimacion(this.personaje, "Ataque");
            this.reproducirAnimacionIdle(this.personaje, "Idle_combate");

            let fallo = this.calcularProbabilidad(this.probaFallarJugador);

            if (fallo) {
                this.mostrarTextoTurnos(0, "player", "miss", "enemy1");

                setTimeout(() => {
                    resolve();
                }, 500);
            } else {
                this.enemigo1.setTint(0xff0000);
                setTimeout(() => {
                    this.enemigo1.clearTint();
                }, 500);

                // Calcula el daño del ataque
                let critico = this.calcularProbabilidad(this.probaCriticoJugador);
                let ataqueTotal = this.ataqueBaseJugador * (critico ? 2 : 1);

                // Baja la vida del enemigo
                this.vidaEnemigo -= ataqueTotal;

                if (ataqueTotal > 0) {
                    this.actualizarBarraVida(this.vidaEnemigo, "enemy1");
                }

                if (critico) {
                    this.mostrarMensaje("Critical hit!");
                }

                this.mostrarTextoTurnos(
                    ataqueTotal,
                    "player",
                    "attack",
                    "enemy1"
                );

                setTimeout(() => {
                    resolve();
                }, 500);
            }
        });
    }

    // Logica para el ataque del enemigo
    ataqueEnemigo(): Promise<void> {
        return new Promise(async (resolve) => {
            await this.reproducirAnimacion(this.enemigo1, "Ataque_izq");
            this.reproducirAnimacionIdle(this.enemigo1, "Idle_izq");

            let fallo = this.calcularProbabilidad(this.probaFallarJugador);

            if (fallo) {
                this.mostrarTextoTurnos(0, "enemy", "miss", "player");

                setTimeout(() => {
                    resolve();
                }, 500);
            } else {
                this.personaje.setTint(0xff0000);
                await this.reproducirAnimacion(this.personaje, "Dañado");
                setTimeout(() => {
                    this.personaje.clearTint();
                }, 500);
                this.reproducirAnimacionIdle(this.personaje, "Idle_combate");

                // Calcula el daño del ataque
                let critico = this.calcularProbabilidad(1);
                let ataqueTotal = this.ataqueBaseEnemigo * (critico ? 2 : 1);

                // Baja la vida del enemigo
                this.vidaJugador -= ataqueTotal;

                if (ataqueTotal > 0) {
                    this.actualizarBarraVida(this.vidaJugador, "player1");
                }

                if (critico) {
                    this.mostrarMensaje("Critical hit!");
                }

                this.mostrarTextoTurnos(
                    ataqueTotal,
                    "enemy",
                    "attack",
                    "player"
                );

                setTimeout(() => {
                    resolve();
                }, 500);
            }
        });
    }

    // Calcula una probabilidad
    calcularProbabilidad(probabilidad: number): Boolean {
        let numero = Phaser.Math.Between(1, 10);

        if (numero <= probabilidad) {
            return true;
        } else {
            return false;
        }
    }

    // Reproduce la animacion si el personaje la tiene
    reproducirAnimacion(
        personaje: GameObjects.Sprite,
        nombreAnimacion: string
    ): Promise<void> {
        return new Promise((resolve) => {
            if (personaje.anims.animationManager.get(nombreAnimacion)) {
                personaje.anims.timeScale = 1;
                personaje.play(nombreAnimacion);

                // Cuando acaba la animacion restaura la velocidad de las animaciones
                personaje.once(`animationcomplete-${nombreAnimacion}`, () => {
                    personaje.anims.timeScale = 0.3;
                    resolve();
                });
            } else {
                // Si no encuentra la animación muestra un mensaje
                console.warn("The animation was not found");
                resolve();
            }
        });
    }

    // Reproduce la animacion si el personaje la tiene
    // Para animaciones idle
    reproducirAnimacionIdle(
        personaje: GameObjects.Sprite,
        nombreAnimacion: string
    ): Promise<void> {
        return new Promise((resolve) => {
            if (personaje.anims.animationManager.get(nombreAnimacion)) {
                personaje.anims.timeScale = 0.3;
                personaje.play({ key: nombreAnimacion, repeat: -1 });

                resolve();
            } else {
                // Si no encuentra la animación muestra un mensaje
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
