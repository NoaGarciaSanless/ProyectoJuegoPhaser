import { AUTO, Game } from "phaser";

// Plugin to change the color in some text easily
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

import BatallaEscena from "./escenas/BatallaEscena";
import BatallaHUD from "./escenas/BatallaHUD";
import InicioEscena from "./escenas/InicioEscena";
import PuebloEscena from "./escenas/PuebloEscena";
import CargaEscena from "./escenas/CargaEscena";
import PuebloHUD from "./escenas/PuebloHUD";
import { CargaEscenaBatalla } from "./escenas/CargaEscenaBatalla";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    pixelArt: true,
    parent: "game-container",
    backgroundColor: "#000000",
    scene: [
        InicioEscena,
        CargaEscenaBatalla,
        BatallaEscena,
        BatallaHUD,
        PuebloEscena,
        PuebloHUD,
        CargaEscena,
    ],
    plugins: {
        scene: [
            {
                key: "rexUI",
                plugin: RexUIPlugin,
                mapping: "rexUI",
            },
        ],
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
