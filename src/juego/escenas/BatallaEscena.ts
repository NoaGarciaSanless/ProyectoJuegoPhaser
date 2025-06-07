import { GameObjects } from "phaser";

import Phaser from "phaser";
import BatallaHUD from "./BatallaHUD";

import { IObjeto } from "../../DTOs/ObjetoDTO";
import {
    ElementoListaPersonajesDTO,
    PersonajeDTO,
} from "../../DTOs/PersonajeDTO";
import { EnemigoDTO } from "../../DTOs/EnemigoDTO";
import { Assets } from "../../compartido/Assets";

// Turnos de la batalla
enum EstadoBatalla {
    TurnoJugador,
    TurnoEnemigo,
    Animacion,
    FinalizarTurno,
    PantallaFin,
}

export default class BatallaEscena extends Phaser.Scene {
    // Sprites usados en la escena
    fondo: GameObjects.Image;
    suelo: GameObjects.Image;
    personaje: GameObjects.Sprite;
    enemigo1: GameObjects.Sprite;

    // Otras escenas
    batallaHUD: BatallaHUD | undefined;

    // Variables para la lógica de turnos
    estadoActual: EstadoBatalla = EstadoBatalla.TurnoJugador;
    ultimoEstado: EstadoBatalla = this.estadoActual;
    turno: number = 1;

    personajeSeleccionado: PersonajeDTO;
    estadisticasPersonaje: ElementoListaPersonajesDTO;
    nombreTexturaJugador: string;

    enemigo: EnemigoDTO;
    nivelEnemigo: number;
    nombreTexturaEnemigo: string;

    vidaJugador: number = 100;
    vidaEnemigo: number = 100;

    private readonly inventarioBatallaJugadorMax: number = 10;

    inventario: Record<string, IObjeto> = {
        pocion_pq: {
            nombre: "Poción pequeña",
            imagen: "Vida_sml",
            cantidad: 2,
            efecto: () => {
                if (this.inventario["pocion_pq"].cantidad > 0) {
                    this.vidaJugador = Math.min(this.vidaJugador + 20, 100);
                    this.actualizarBarraVida(this.vidaJugador, "player1");
                    this.mostrarTextoTurnos(20, "player", "curar");

                    this.inventario["pocion_pq"].cantidad--;

                    this.estadoActual = EstadoBatalla.FinalizarTurno;
                    this.siguienteTurno();
                }
            },
        },
    };

    constructor() {
        super("EscenaBatalla");
    }

    async init(data: {
        personajeSeleccionado: PersonajeDTO;
        estadisticas: ElementoListaPersonajesDTO;
        enemigo: EnemigoDTO;
        nivelEnemigo: number;
    }) {
        // Personaje
        this.personajeSeleccionado = data.personajeSeleccionado;
        this.estadisticasPersonaje = data.estadisticas;
        this.nombreTexturaJugador = `jugador_personaje_${this.personajeSeleccionado.id}`;

        // Enemigo
        this.enemigo = data.enemigo;
        this.nivelEnemigo = data.nivelEnemigo;
        this.nombreTexturaEnemigo = `enemigo_${this.enemigo.id}`;
    }

    preload() {
        this.cameras.main.fadeIn(2500, 0, 0, 0);

        // Recarga el fondo
        if (this.textures.exists("fondo")) {
            this.textures.remove("fondo");
        }
        this.load.image("fondo", Assets.fondoBosque_sprite);

        // Recarga el suelo
        if (this.textures.exists("suelo")) {
            this.textures.remove("suelo");
        }
        this.load.image("suelo", "assets/backgrounds/suelo.png");

        this.load.aseprite(
            "arboles",
            "assets/decoraciones/assetsNaturaleza.png",
            "assets/decoraciones/assetsNaturaleza.json"
        );

        this.load.aseprite(
            this.nombreTexturaJugador,
            this.personajeSeleccionado.spriteURL,
            this.personajeSeleccionado.jsonURL
        );

        this.load.aseprite(
            this.nombreTexturaEnemigo,
            this.enemigo!.spriteURL,
            this.enemigo!.jsonURL
        );
    }

    create() {
        const { width, height } = this.scale;

        // Otras escenas
        this.batallaHUD = this.scene.get("BatallaHUD") as BatallaHUD;
        this.scene.launch("BatallaHUD");

        // Espera a que BatallaHUD esté lista
        this.scene.get("BatallaHUD").events.once("create", () => {
            // Crea el escenario y personajes
            this.crearEscenario(width, height);
            this.crearArbolesAleatorio(["Arbol-0", "Arbol-1", "Arbol-2"]);
            this.crearPersonajes(width, height);

            // Inicia el texto de turnos
            this.mostrarTextoTurnos(this.turno, "turns", "mostrarLog");
            this.turno++;

            // Configura eventos
            this.configurarEventos();
        });
    }

    // Configura los eventos
    private configurarEventos() {
        this.events.on("personaje-ataque", async () => {
            if (this.estadoActual !== EstadoBatalla.TurnoJugador) return;
            await this.ataqueJugador();
            this.estadoActual = EstadoBatalla.FinalizarTurno;
            this.siguienteTurno();
        });

        this.events.on("use-item", (item: IObjeto) => item.efecto());
    }

    // Creación de elementos----------------------------------------------
    // Crea los elementos de los personajes
    private crearPersonajes(width: number, height: number) {
        // Esqueleto
        this.generarAnimacion(this.nombreTexturaEnemigo);

        this.enemigo1 = this.add
            .sprite(width / 1.5, height / 1.4, this.nombreTexturaEnemigo, 16)
            .setOrigin(0.5, 0.5)
            .setScale(4, 4);

        this.reproducirAnimacionIdle(
            this.enemigo1,
            this.nombreTexturaEnemigo,
            "Idle_izq",
            0.3
        );
        this.crearBarraVida(
            this.enemigo1.x,
            this.enemigo1.y,
            this.vidaEnemigo,
            "enemy1"
        );
        this.crearTextoNivel(
            this.enemigo1.x,
            this.enemigo1.y,
            this.nivelEnemigo
        );

        // Personaje
        this.generarAnimacion(this.nombreTexturaJugador);

        this.personaje = this.add
            .sprite(width / 3.5, height / 1.4, this.nombreTexturaJugador, 0)
            .setOrigin(0.5, 0.5)
            .setScale(4, 4);

        this.reproducirAnimacionIdle(
            this.personaje,
            this.nombreTexturaJugador,
            "Idle_combate"
        );
        this.reproducirAnimacionIdle(
            this.personaje,
            this.nombreTexturaJugador,
            "Idle_combate",
            0.3
        );
        this.crearBarraVida(
            this.personaje.x,
            this.personaje.y,
            this.vidaJugador,
            "player1"
        );
        this.crearTextoNivel(
            this.personaje.x,
            this.personaje.y,
            this.estadisticasPersonaje.nivel
        );
    }

    private crearEscenario(width: number, height: number) {
        // Fondo -----------------------------------------
        this.fondo = this.add
            .sprite(0, 0, "fondo")
            .setOrigin(0, 0)
            .setDisplaySize(width, height / 1.5);

        // Suelo
        const sueloY = this.fondo.displayHeight;
        this.suelo = this.add
            .sprite(0, sueloY, "suelo")
            .setOrigin(0.1, 0.4)
            .setDisplaySize(width * 1.3, (height - sueloY) * 2);
    }

    // Crea un numero aleatorio de arboles
    private crearArbolesAleatorio(framesArboles: string[]) {
        const sueloY = this.fondo.displayHeight;
        let numeroArboles = Math.trunc(Math.max(Math.random() * 4));
        const xUsadas: number[] = [];

        for (let i = 0; i <= numeroArboles; i++) {
            const frameArbol = Phaser.Math.RND.pick(framesArboles);
            let xPos: number;
            do {
                xPos = Phaser.Math.FloatBetween(-4.32, 0);
            } while (xUsadas.some((usado) => Math.abs(usado - xPos) < 0.9));

            xUsadas.push(xPos);
            this.add
                .sprite(0, sueloY - 200, "arboles", frameArbol)
                .setOrigin(xPos, 0.5)
                .setScale(3);
        }
    }

    // Métodos de HUD -------------------------------------
    // Muestra el texto en el container de los turnos
    private mostrarTextoTurnos(
        cantidad: number,
        personajes: string,
        accion: string,
        objetivo?: string
    ) {
        this.batallaHUD?.events.emit(
            "mostrar_texto_log",
            cantidad,
            personajes,
            accion,
            objetivo
        );
    }

    // Muestra un texto en el medio de la escena
    private mostrarMensaje(texto: string) {
        this.batallaHUD?.events.emit("texto_extra", texto);
    }

    // Crea la barra de vida en el HUD
    private crearBarraVida(
        posX: number,
        posY: number,
        vida: number,
        key: string
    ) {
        this.batallaHUD?.events.emit("crear_barra_vida", posX, posY, vida, key);
    }

    // Actualiza la barra de vida
    actualizarBarraVida(cantidad: number, key: string) {
        this.batallaHUD?.events.emit("actualizar_barra_vida", cantidad, key);
    }

    private crearTextoNivel(
        posX: number,
        posY: number,
        nivelPersonaje: number
    ) {
        this.batallaHUD?.events.emit("texto_nivel", posX, posY, nivelPersonaje);
    }

    // Animaciones y assets ----------------------------------------------

    // Genera animaciones individuales para cada elemento que las necesite y así evitar conflictos
    private generarAnimacion(elemento: string) {
        // Comprueba si existen las animaciones
        if (
            this.anims.exists(`${elemento}_Animacion_defecto`) ||
            this.anims.exists(`${elemento}_TC_izq`)
        ) {
            return;
        }

        const animaciones = this.anims.createFromAseprite(elemento);
        animaciones.forEach((animacion) => {
            const nuevaKey = `${elemento}_${animacion.key}`;

            this.anims.remove(animacion.key);

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

    // Reproduce la animacion si el personaje la tiene
    private async reproducirAnimacion(
        personaje: GameObjects.Sprite,
        nombreTextura: string,
        nombreAnimacion: string,
        velocidad: number = 1
    ): Promise<void> {
        const animacion = `${nombreTextura}_${nombreAnimacion}`;
        if (!personaje.anims.animationManager.get(animacion)) {
            console.warn(`No se ha encontrado la animación: ${animacion}`);
            return;
        }

        personaje.anims.timeScale = velocidad;
        personaje.play(animacion);
        await new Promise<void>((resolve) => {
            personaje.once(`animationcomplete-${animacion}`, () => {
                personaje.anims.timeScale = 0.3;
                resolve();
            });
        });
    }

    // Reproduce la animacion si el personaje la tiene
    // Para animaciones idle
    private async reproducirAnimacionIdle(
        personaje: GameObjects.Sprite,
        nombreTextura: string,
        nombreAnimacion: string,
        velocidad: number = 0.3
    ): Promise<void> {
        const animacion = `${nombreTextura}_${nombreAnimacion}`;
        if (!personaje.anims.animationManager.get(animacion)) {
            console.warn(`No se ha encontrado la animación: ${animacion}`);
            return;
        }
        personaje.anims.timeScale = velocidad;
        personaje.play({ key: animacion, repeat: -1 });
    }

    // Lógica batalla-----------------------------------------------------

    // Controla la lógica de los turnos
    private async siguienteTurno() {
        switch (this.estadoActual) {
            case EstadoBatalla.TurnoJugador:
                this.batallaHUD?.events.emit("limpiar_texto");
                this.mostrarTextoTurnos(this.turno, "turns", "mostrarLog");
                this.turno++;
                this.batallaHUD?.events.emit("permitir_ataque");
                break;

            case EstadoBatalla.TurnoEnemigo:
                await this.ataqueEnemigo();
                this.estadoActual = EstadoBatalla.FinalizarTurno;
                this.siguienteTurno();
                break;

            case EstadoBatalla.Animacion:
                await this.esperar(2000);
                this.estadoActual = EstadoBatalla.TurnoEnemigo;
                this.siguienteTurno();
                break;

            case EstadoBatalla.FinalizarTurno:
                this.actualizarBarraVida(this.vidaJugador, "player1");
                this.actualizarBarraVida(this.vidaEnemigo, "enemy1");

                if (this.vidaJugador <= 0) {
                    this.batallaHUD?.events.emit("desactivar-botones");
                    this.batallaHUD?.events.emit("game_over");
                    await this.reproducirAnimacion(
                        this.personaje,
                        this.nombreTexturaJugador,
                        "Derrota_derch"
                    );
                    this.estadoActual = EstadoBatalla.PantallaFin;
                    this.siguienteTurno();
                } else if (this.vidaEnemigo <= 0) {
                    this.batallaHUD?.events.emit("desactivar-botones");
                    this.batallaHUD?.events.emit("victory");
                    await this.reproducirAnimacion(
                        this.enemigo1,
                        this.nombreTexturaEnemigo,
                        "Derrota_derch"
                    );
                    this.estadoActual = EstadoBatalla.PantallaFin;
                    this.siguienteTurno();
                } else {
                    await this.esperar(1000);
                    this.estadoActual =
                        this.ultimoEstado === EstadoBatalla.TurnoJugador
                            ? EstadoBatalla.TurnoEnemigo
                            : EstadoBatalla.TurnoJugador;
                    this.ultimoEstado = this.estadoActual;
                    this.siguienteTurno();
                }
                break;

            case EstadoBatalla.PantallaFin:
                break;
        }
    }

    // Logica para el ataque del personaje
    private async ataqueJugador(): Promise<void> {
        await this.reproducirAnimacion(
            this.personaje,
            this.nombreTexturaJugador,
            "Ataque_basico"
        );
        await this.reproducirAnimacionIdle(
            this.personaje,
            this.nombreTexturaJugador,
            "Idle_combate"
        );

        const acierto = this.calcularProbabilidad(
            this.personajeSeleccionado.precisionBase
        );
        if (!acierto) {
            this.mostrarTextoTurnos(0, "player", "fallo", "enemy1");
            await this.esperar(500);
            return;
        }

        this.enemigo1.setTint(0xff3232);

        await this.reproducirAnimacion(
            this.enemigo1,
            this.nombreTexturaEnemigo,
            "Dañado_izq"
        );
        this.esperar(100);
        this.enemigo1.clearTint();
        await this.reproducirAnimacionIdle(
            this.enemigo1,
            this.nombreTexturaEnemigo,
            "Idle_izq"
        );

        const critico = this.calcularProbabilidad(
            this.personajeSeleccionado.criticoBase
        );
        const ataque =
            this.personajeSeleccionado.ataqueBase +
            this.personajeSeleccionado.ataquePorNivel *
                this.estadisticasPersonaje.nivel;
        const ataqueTotal = ataque * (critico ? 2 : 1);

        this.vidaEnemigo = Math.max(0, this.vidaEnemigo - ataqueTotal);
        this.actualizarBarraVida(this.vidaEnemigo, "enemy1");

        if (critico) this.mostrarMensaje("¡Golpe crítico!");
        this.mostrarTextoTurnos(ataqueTotal, "player", "ataque", "enemy1");

        await this.esperar(500);
    }

    // Logica para el ataque del enemigo
    private async ataqueEnemigo(): Promise<void> {
        await this.reproducirAnimacion(
            this.enemigo1,
            this.nombreTexturaEnemigo,
            "Ataque_izq"
        );
        await this.reproducirAnimacionIdle(
            this.enemigo1,
            this.nombreTexturaEnemigo,
            "Idle_izq"
        );

        const acierto = this.calcularProbabilidad(this.enemigo.precisionBase);
        if (!acierto) {
            this.mostrarTextoTurnos(0, "enemy", "fallo", "player");
            await this.esperar(500);
            return;
        }

        this.personaje.setTint(0xff3232);
        await this.reproducirAnimacion(
            this.personaje,
            this.nombreTexturaJugador,
            "Dañado_derch"
        );
        this.esperar(100);
        this.personaje.clearTint();
        await this.reproducirAnimacionIdle(
            this.personaje,
            this.nombreTexturaJugador,
            "Idle_combate"
        );

        const critico = this.calcularProbabilidad(this.enemigo.criticoBase);
        const ataque =
            this.enemigo.ataqueBase +
            this.enemigo.ataquePorNivel * this.nivelEnemigo;
        const ataqueTotal = ataque * (critico ? 2 : 1);

        this.vidaJugador = Math.max(0, this.vidaJugador - ataqueTotal);
        this.actualizarBarraVida(this.vidaJugador, "player1");

        if (critico) this.mostrarMensaje("¡Golpe crítico!");
        this.mostrarTextoTurnos(ataqueTotal, "enemy", "ataque", "player");

        await this.esperar(500);
    }

    // Calcula una probabilidad
    private calcularProbabilidad(probabilidad: number): Boolean {
        let numero = Phaser.Math.Between(1, 10);

        if (numero <= probabilidad) {
            return true;
        } else {
            return false;
        }
    }

    // Espera la cantidad de tiempo que se le indica
    private async esperar(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    update() {}

    destroy() {
        this.events.removeAllListeners();
        this.children.removeAll();
    }
}
