import 'phaser';
import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import GameScene from './scenes/GameScene';

const config = {
  type: Phaser.WEBGL,
  parent: 'content',
  width: 800,
  height: 600,
  scene: [
    BootScene,
    TitleScene,
    GameScene
  ],
  physics: {
    default: 'arcade',
    arcade: {gravity: { y: 0 }}
  }
};


// eslint-disable-next-line no-unused-vars
const game = new Phaser.Game( config );