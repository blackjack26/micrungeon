import 'phaser';
import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import GameScene from './scenes/GameScene';

const config = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 800,
  height: 600,
  scene: [
    BootScene,
    TitleScene,
    GameScene
  ]
};

// eslint-disable-next-line no-unused-vars
const game = new Phaser.Game( config );