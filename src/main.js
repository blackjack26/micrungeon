import 'phaser';
import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';

const config = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 800,
  height: 600,
  scene: [
    BootScene,
    TitleScene
  ]
};

var game = new Phaser.Game(config);