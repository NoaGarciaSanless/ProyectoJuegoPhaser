import { AUTO, Game } from 'phaser';
import  BattleScene  from './scenes/BattleScene';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1366,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#FFFFFF',
    scene: [
        BattleScene,
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
