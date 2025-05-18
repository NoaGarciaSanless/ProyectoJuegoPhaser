import { GameObjects } from "phaser";
import { Assets } from "../../compartido/Assets";

export default class PuebloEscena extends Phaser.Scene {
    fondo: GameObjects.Image;

    // Mapa
    suelo: GameObjects.Image;

    // Jugador
    jugador!: GameObjects.Sprite;

    // Teclado
    cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
    teclaA!: Phaser.Input.Keyboard.Key;
    teclaD!: Phaser.Input.Keyboard.Key;

    // Variables -----------------
    mirarDerecha: boolean = true;

    // variables para imagenes temporal
    urlSprite =
        "https://res.cloudinary.com/juegoporturnosdaw-img/image/upload/v1747602942/encapuchado_phaser_pxzhwj.png";
    urlJson =
        "https://res.cloudinary.com/juegoporturnosdaw-img/raw/upload/v1747602934/encapuchado_phaser_yd0m0k.json";

    constructor() {
        super("PuebloEscena");
    }

    preload() {
        this.load.image("fondo", Assets.fondoBosque_sprite);

        this.load.aseprite("jugador", this.urlSprite, this.urlJson);

        this.load.image("suelo", Assets.sueloPueblo);
    }

    create() {
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

        // Jugador
        this.anims.createFromAseprite("jugador");

        this.jugador = this.add.sprite(width / 3.5, height / 1.3, "jugador", 0);
        this.jugador.setOrigin(0.5, 0.5);
        this.jugador.setScale(4, 4);

        // Animaciones del jugador, animaciones intercaladas para mayor fluidéz
        this.jugador.on(
            "animationcomplete",
            (anim: Phaser.Animations.Animation) => {
                if (anim.key === "TC_izq") {
                    this.jugador.play({ key: "Cam_izq", repeat: -1 });
                } else if (anim.key === "TC_derch") {
                    this.jugador.play({ key: "Cam_derch", repeat: -1 });
                }
            }
        );

        this.cursor = this.input.keyboard!.createCursorKeys();
        this.teclaA = this.input.keyboard!.addKey("A");
        this.teclaD = this.input.keyboard!.addKey("D");

        // Cámara
        this.cameras.main.startFollow(this.jugador);
        this.cameras.main.setBounds(
            0,
            0,
            this.suelo.width * this.suelo.scaleX,
            600
        ); // límites de la cámara si tu fondo es más grande que el canvas
    }

    update(): void {
        // Ajusta la velocidad del jugador
        const velocidad = 6;

        let anchoSuelo = this.suelo.width * this.suelo.scaleX;
        let animacionActual = this.jugador.anims.currentAnim?.key;

        // Establece una animación
        if (this.cursor.left.isDown || this.teclaA.isDown) {
            this.jugador.x -= velocidad;

            // Ejecuta la animación
            if (animacionActual !== "Cam_izq" && animacionActual !== "TC_izq") {
                this.jugador.anims.timeScale = 1;
                this.jugador.play({ key: "TC_izq" });
            }

            this.mirarDerecha = false;
        } else if (this.cursor.right.isDown || this.teclaD.isDown) {
            this.jugador.x += velocidad;

            // Ejecuta la animación
            if (
                animacionActual !== "Cam_derch" &&
                animacionActual !== "TC_derch"
            ) {
                this.jugador.anims.timeScale = 1;
                this.jugador.play({ key: "TC_derch" });
            }

            this.mirarDerecha = true;
        } else {
            if (animacionActual !== "Idle_derch") {
                this.jugador.anims.timeScale = 0.3;

                // Ejecuta la animación
                if (this.mirarDerecha) {
                    this.jugador.play({ key: "Idle_derch", repeat: -1 });
                } else {
                    this.jugador.play({ key: "Idle_izq", repeat: -1 });
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
}
