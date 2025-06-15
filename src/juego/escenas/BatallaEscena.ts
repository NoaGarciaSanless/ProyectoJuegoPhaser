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
    jugadorSprite: GameObjects.Sprite;
    enemigoSprite: GameObjects.Sprite;

    // Otras escenas
    batallaHUD: BatallaHUD | undefined;

    // Variables para la lógica de turnos
    estadoActual: EstadoBatalla = EstadoBatalla.TurnoJugador;
    ultimoEstado: EstadoBatalla = this.estadoActual;
    turno: number = 1;
    resultado: string = "";

    personajeJugadorSeleccionado: PersonajeDTO;
    estadisticasPersonaje: ElementoListaPersonajesDTO;
    nombreTexturaJugador: string;

    enemigo: EnemigoDTO;
    nivelEnemigo: number;
    nombreTexturaEnemigo: string;

    vidaJugador: number = 100;
    vidaMaxJugador: number = 100;
    vidaEnemigo: number = 100;
    vidaMaxEnemigo: number = 100;

    private readonly inventarioBatallaJugadorMax: number = 10;

    inventario: Record<string, IObjeto> = {
        pocion_pq: {
            nombre: "Poción pequeña",
            imagen: "Vida_sml",
            cantidad: 2,
            efecto: () => {
                if (this.inventario["pocion_pq"].cantidad > 0) {
                    this.vidaJugador = Math.min(
                        this.vidaJugador + 20,
                        this.vidaMaxJugador
                    );
                    this.actualizarBarraVida(
                        this.vidaJugador,
                        this.vidaMaxJugador,
                        "jugador"
                    );
                    this.mostrarTextoTurnos(20, "jugador", "curar");

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
        this.personajeJugadorSeleccionado = data.personajeSeleccionado;
        this.estadisticasPersonaje = data.estadisticas;
        this.nombreTexturaJugador = `jugador_personaje_${this.personajeJugadorSeleccionado.id}`;

        // Enemigo
        this.enemigo = data.enemigo;
        this.nivelEnemigo = data.nivelEnemigo;
        this.nombreTexturaEnemigo = `enemigo_${this.enemigo.id}`;

        // Variables de inicio de escena
        this.vidaMaxJugador =
            this.personajeJugadorSeleccionado.vidaBase +
            this.personajeJugadorSeleccionado.vidaPorNivel *
                this.estadisticasPersonaje.nivel;
        this.vidaJugador = this.vidaMaxJugador;
        this.vidaMaxEnemigo =
            this.enemigo.vidaBase +
            this.enemigo.vidaPorNivel * this.nivelEnemigo;
        this.vidaEnemigo = this.vidaMaxEnemigo;

        this.turno = 1;
        this.estadoActual = EstadoBatalla.TurnoJugador;
        this.resultado = "";
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
        this.load.image("suelo", Assets.suelo_escenaBatalla_sprite);

        this.load.aseprite(
            "assets_bosque",
            Assets.assets_bosque_sprite,
            Assets.assets_bosque_json
        );

        this.load.aseprite(
            this.nombreTexturaJugador,
            this.personajeJugadorSeleccionado.spriteURL,
            this.personajeJugadorSeleccionado.jsonURL
        );

        this.load.aseprite(
            this.nombreTexturaEnemigo,
            this.enemigo!.spriteURL,
            this.enemigo!.jsonURL
        );
    }

    create() {
        // Limpia los listeners
        this.eliminarEventos();

        const { width, height } = this.scale;

        // Otras escenas
        this.batallaHUD = this.scene.get("BatallaHUD") as BatallaHUD;
        this.scene.launch("BatallaHUD");

        // Espera a que BatallaHUD esté lista
        this.scene.get("BatallaHUD").events.once("create", () => {
            // Crea el escenario y personajes
            this.crearEscenario(width, height);
            this.crearRocasAleatorio(["Rocas-0", "Rocas-1", "Rocas-2"]);
            this.crearArbolesAleatorio(["Arbol-0", "Arbol-1", "Arbol-2"]);
            this.crearArbustosAleatorio(["Arbusto-0", "Arbusto-1"]);
            this.crearPersonajes(width, height);

            // Inicia el texto de turnos
            this.mostrarTextoTurnos(this.turno, "turns", "mostrarLog");
            this.turno++;

            // Configura eventos
            this.configurarEventos();

            // Se asegura de que se puede atacar
            this.batallaHUD?.events.emit("permitir_interaccion");
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

        this.events.on("usar-objeto", (item: IObjeto) => item.efecto());

        this.events.on("volver_al_pueblo", () => {
            this.cameras.main.fadeOut(2500, 0, 0, 0);
            this.scene.stop("EscenaBatalla");
            this.scene.stop("BatallaHUD");
            this.scene.start("CargaEscena");
        });
        this.events.on("siguiente_batalla", () => {
            this.cameras.main.fadeOut(2500, 0, 0, 0);
            this.scene.stop("EscenaBatalla");
            this.scene.stop("BatallaHUD");
            this.scene.start("CargaEscenaBatalla");
        });
    }

    // Creación de elementos----------------------------------------------
    // Crea los elementos de los personajes
    private crearPersonajes(width: number, height: number) {
        // Esqueleto
        this.generarAnimacion(this.nombreTexturaEnemigo);

        this.enemigoSprite = this.add
            .sprite(width / 1.5, height / 1.4, this.nombreTexturaEnemigo, 16)
            .setOrigin(0.5, 0.5)
            .setScale(4, 4);

        this.reproducirAnimacionIdle(
            this.enemigoSprite,
            this.nombreTexturaEnemigo,
            "Idle_izq",
            0.3
        );
        this.crearBarraVida(
            this.enemigoSprite.x,
            this.enemigoSprite.y,
            this.vidaMaxEnemigo,
            "enemigo"
        );
        this.crearTextoNivel(
            this.enemigoSprite.x,
            this.enemigoSprite.y,
            this.nivelEnemigo
        );

        // Personaje
        this.generarAnimacion(this.nombreTexturaJugador);

        this.jugadorSprite = this.add
            .sprite(width / 3.5, height / 1.4, this.nombreTexturaJugador, 0)
            .setOrigin(0.5, 0.5)
            .setScale(4, 4);

        this.reproducirAnimacionIdle(
            this.jugadorSprite,
            this.nombreTexturaJugador,
            "Idle_combate"
        );
        this.reproducirAnimacionIdle(
            this.jugadorSprite,
            this.nombreTexturaJugador,
            "Idle_combate",
            0.3
        );
        this.crearBarraVida(
            this.jugadorSprite.x,
            this.jugadorSprite.y,
            this.vidaMaxJugador,
            "jugador"
        );
        this.crearTextoNivel(
            this.jugadorSprite.x,
            this.jugadorSprite.y,
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
                .sprite(0, sueloY - 200, "assets_bosque", frameArbol)
                .setOrigin(xPos, 0.5)
                .setScale(3);
        }
    }

    private crearArbustosAleatorio(framesArbustos: string[]) {
        const sueloY = this.fondo.displayHeight;
        let numeroArbustos = Math.trunc(Math.max(Math.random() * 5));
        const xUsadas: number[] = [];

        for (let i = 0; i <= numeroArbustos; i++) {
            const frameArbusto = Phaser.Math.RND.pick(framesArbustos);
            let xPos: number;
            do {
                xPos = Phaser.Math.FloatBetween(-4.32, 0);
            } while (xUsadas.some((usado) => Math.abs(usado - xPos) < 0.9));

            xUsadas.push(xPos);
            this.add
                .sprite(0, sueloY - 180, "assets_bosque", frameArbusto)
                .setOrigin(xPos, 0.5)
                .setScale(3);
        }
    }

    private crearRocasAleatorio(framesRocas: string[]) {
        const sueloY = this.fondo.displayHeight;
        let numeroRocas = Math.trunc(Math.max(Math.random() * 3));
        const xUsadas: number[] = [];

        for (let i = 0; i <= numeroRocas; i++) {
            const frameRoca = Phaser.Math.RND.pick(framesRocas);
            let xPos: number;
            do {
                xPos = Phaser.Math.FloatBetween(-4.32, 0);
            } while (xUsadas.some((usado) => Math.abs(usado - xPos) < 0.9));

            xUsadas.push(xPos);
            this.add
                .sprite(0, sueloY - 250, "assets_bosque", frameRoca)
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
    actualizarBarraVida(cantidad: number, vidaMax: number, key: string) {
        this.batallaHUD?.events.emit(
            "actualizar_barra_vida",
            cantidad,
            vidaMax,
            key
        );
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
        let animacionesExisten = Object.keys(this.anims.anims.entries).some(
            (nombre) => nombre.startsWith(elemento)
        );
        if (animacionesExisten) return;

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
                this.batallaHUD?.events.emit("permitir_interaccion");
                break;

            case EstadoBatalla.TurnoEnemigo:
                this.batallaHUD?.events.emit("desactivar_interaccion");
                await this.ataqueEnemigo();
                this.estadoActual = EstadoBatalla.FinalizarTurno;
                this.siguienteTurno();
                break;

            case EstadoBatalla.Animacion:
                await this.esperar(2000);
                this.estadoActual = EstadoBatalla.TurnoEnemigo;
                this.batallaHUD?.events.emit("desactivar_interaccion");
                this.siguienteTurno();
                break;

            case EstadoBatalla.FinalizarTurno:
                this.actualizarBarraVida(
                    this.vidaJugador,
                    this.vidaMaxJugador,
                    "jugador"
                );
                this.actualizarBarraVida(
                    this.vidaEnemigo,
                    this.vidaMaxEnemigo,
                    "enemigo"
                );

                if (this.vidaJugador <= 0) {
                    this.batallaHUD?.events.emit("desactivar-botones");
                    this.batallaHUD?.events.emit("derrota");
                    this.resultado = "derrota";
                    await this.esperar(1000);
                    await this.reproducirAnimacion(
                        this.jugadorSprite,
                        this.nombreTexturaJugador,
                        "Derrota_derch"
                    );
                    this.estadoActual = EstadoBatalla.PantallaFin;
                    this.siguienteTurno();
                } else if (this.vidaEnemigo <= 0) {
                    this.batallaHUD?.events.emit("desactivar-botones");
                    await this.reproducirAnimacion(
                        this.enemigoSprite,
                        this.nombreTexturaEnemigo,
                        "Derrota_izq"
                    );
                    this.batallaHUD?.events.emit("victoria");
                    this.resultado = "victoria";
                    await this.esperar(1000);
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
                let experiencia = 0;
                if (this.resultado == "victoria") {
                    experiencia = Phaser.Math.Between(100, 200);
                } else {
                    experiencia = Phaser.Math.Between(20, 50);
                }

                this.batallaHUD?.events.emit(
                    "mostrar_pantalla_fin",
                    experiencia,
                    this.resultado
                );
                break;
        }
    }

    // Logica para el ataque del personaje
    private async ataqueJugador(): Promise<void> {
        await this.reproducirAnimacion(
            this.jugadorSprite,
            this.nombreTexturaJugador,
            "Ataque_basico"
        );
        await this.reproducirAnimacionIdle(
            this.jugadorSprite,
            this.nombreTexturaJugador,
            "Idle_combate"
        );

        const acierto = this.calcularProbabilidad(
            this.personajeJugadorSeleccionado.precisionBase
        );
        if (!acierto) {
            this.mostrarTextoTurnos(0, "jugador", "fallo", "enemigo");
            await this.esperar(500);
            return;
        }

        this.enemigoSprite.setTint(0xff3232);

        await this.reproducirAnimacion(
            this.enemigoSprite,
            this.nombreTexturaEnemigo,
            "Dañado_izq"
        );
        this.esperar(100);
        this.enemigoSprite.clearTint();
        await this.reproducirAnimacionIdle(
            this.enemigoSprite,
            this.nombreTexturaEnemigo,
            "Idle_izq"
        );

        const critico = this.calcularProbabilidad(
            this.personajeJugadorSeleccionado.criticoBase
        );
        const ataque = this.calcularAtaquePersonaje();
        const defensaEnemigo =
            this.enemigo.defensaBase +
            this.nivelEnemigo * this.enemigo.defensaPorNivel;
        const ataqueTotal = ataque * (critico ? 2 : 1) - defensaEnemigo;

        this.vidaEnemigo = Math.max(0, this.vidaEnemigo - ataqueTotal);
        this.actualizarBarraVida(
            this.vidaEnemigo,
            this.vidaMaxEnemigo,
            "enemigo"
        );

        if (critico) this.mostrarMensaje("¡Golpe crítico!");
        this.mostrarTextoTurnos(ataqueTotal, "jugador", "ataque", "enemigo");

        await this.esperar(500);
    }

    // Logica para el ataque del enemigo
    private async ataqueEnemigo(): Promise<void> {
        await this.reproducirAnimacion(
            this.enemigoSprite,
            this.nombreTexturaEnemigo,
            "Ataque_izq"
        );
        await this.reproducirAnimacionIdle(
            this.enemigoSprite,
            this.nombreTexturaEnemigo,
            "Idle_izq"
        );

        const acierto = this.calcularProbabilidad(this.enemigo.precisionBase);
        if (!acierto) {
            this.mostrarTextoTurnos(0, "enemigo", "fallo", "jugador");
            await this.esperar(500);
            return;
        }

        this.jugadorSprite.setTint(0xff3232);
        await this.reproducirAnimacion(
            this.jugadorSprite,
            this.nombreTexturaJugador,
            "Dañado_derch"
        );
        this.esperar(100);
        this.jugadorSprite.clearTint();
        await this.reproducirAnimacionIdle(
            this.jugadorSprite,
            this.nombreTexturaJugador,
            "Idle_combate"
        );

        const critico = this.calcularProbabilidad(this.enemigo.criticoBase);
        const ataque = this.calcularAtaqueEnemigo();
        const defensaPersonajeJugador =
            this.personajeJugadorSeleccionado.defensaBase +
            this.personajeJugadorSeleccionado.defensaPorNivel *
                this.estadisticasPersonaje.nivel;
        const ataqueTotal =
            ataque * (critico ? 2 : 1) - defensaPersonajeJugador;

        this.vidaJugador = Math.max(0, this.vidaJugador - ataqueTotal);
        this.actualizarBarraVida(
            this.vidaJugador,
            this.vidaMaxJugador,
            "jugador"
        );

        if (critico) this.mostrarMensaje("¡Golpe crítico!");
        this.mostrarTextoTurnos(ataqueTotal, "enemigo", "ataque", "jugador");

        await this.esperar(500);
    }

    private calcularAtaquePersonaje(): number {
        let ataque = 0;

        if (this.personajeJugadorSeleccionado.tipoAtaquePrincipal == "fisico") {
            ataque =
                this.personajeJugadorSeleccionado.ataqueBase +
                this.personajeJugadorSeleccionado.ataquePorNivel *
                    this.estadisticasPersonaje.nivel;
        } else {
            ataque =
                this.personajeJugadorSeleccionado.ataqueMagicoBase +
                this.personajeJugadorSeleccionado.ataqueMagicoPorNivel *
                    this.estadisticasPersonaje.nivel;
        }

        return ataque;
    }

    private calcularAtaqueEnemigo(): number {
        let ataque = 0;

        if (this.enemigo.tipoAtaquePrincipal == "fisico") {
            ataque =
                this.enemigo.ataqueBase +
                this.enemigo.ataquePorNivel * this.nivelEnemigo;
        } else {
            ataque =
                this.enemigo.ataqueMagicoBase +
                this.enemigo.ataqueMagicoPorNivel * this.nivelEnemigo;
        }

        return ataque;
    }

    // Calcula una probabilidad
    private calcularProbabilidad(probabilidad: number): Boolean {
        let numero = Phaser.Math.Between(1, 10);

        // console.log(`Probabilidad: ${probabilidad} y numero ${numero}`);

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

    private eliminarEventos() {
        // Eliminar solo listeners específicos
        this.events.off("personaje-ataque");
        this.events.off("usar-objeto");
        this.events.off("volver_al_pueblo");
    }

    update() {}

    destroy() {
        // Destruir sprites
        this.jugadorSprite?.destroy();
        this.enemigoSprite?.destroy();
        this.suelo?.destroy();
        this.fondo?.destroy();

        // Destruir elementos del escenario (árboles, arbustos, rocas)
        this.children.list
            .filter(
                (child) =>
                    child instanceof Phaser.GameObjects.Sprite &&
                    child.texture.key === "assets_bosque"
            )
            .forEach((child) => child.destroy());
    }
}
