import { GameObjects } from "phaser";
import { Assets } from "../../compartido/Assets";

export default class PuebloEscena extends Phaser.Scene {
    fondo: GameObjects.Image;

    // Jugador
    jugador!: GameObjects.Sprite;

    // Teclado
    cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
    teclaA!: Phaser.Input.Keyboard.Key;
    teclaD!: Phaser.Input.Keyboard.Key;

    // variables para imagenes temporal
    urlSprite =
        "https://res.cloudinary.com/juegoporturnosdaw-img/image/upload/v1747071044/encapuchado_phaser_pxzhwj.png";
    urlJson =
        "https://res.cloudinary.com/juegoporturnosdaw-img/raw/upload/v1746991440/encapuchado_phaser_yd0m0k.json";

    constructor() {
        super("PuebloEscena");
    }

    preload() {
        this.load.image("fondo", Assets.fondoBosque_sprite);

        this.load.aseprite("jugador", this.urlSprite, this.urlJson);
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

        // Jugador
        this.jugador = this.add.sprite(width / 3.5, height / 1.4, "jugador", 0);
        this.jugador.setOrigin(0.5, 0.5);
        this.jugador.setScale(4, 4);

        this.cursor = this.input.keyboard!.createCursorKeys();
        this.teclaA = this.input.keyboard!.addKey("A");
        this.teclaD = this.input.keyboard!.addKey("D");

        // Cámara
        this.cameras.main.startFollow(this.jugador);
        this.cameras.main.setBounds(0, 0, 2000, 600); // límites de la cámara si tu fondo es más grande que el canvas
    }

    update(): void {
        const velocidad = 5;

        if (this.cursor.left.isDown || this.teclaA.isDown) {
            this.jugador.x -= velocidad;
            // this.jugador.anims.play("walk", true);
            this.jugador.setFlipX(true);
        } else if (this.cursor.right.isDown || this.teclaD.isDown) {
            this.jugador.x += velocidad;
            // this.jugador.anims.play("walk", true);
            this.jugador.setFlipX(false);
        } else {
            this.jugador.anims.stop();
        }
    }

  
}
