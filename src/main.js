import 'phaser';
import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import GameScene from './scenes/GameScene';
import InventoryScene from './scenes/InventoryScene';
import PauseScene from './scenes/PauseScene';

/**
 * The configuration object for the Phaser Game instance
 * @type {GameConfig}
 */
const config = {
  type: Phaser.WEBGL,
  parent: 'content',
  width: 800,
  height: 600,
  scene: [
    BootScene,
    TitleScene,
    GameScene,
    InventoryScene,
    PauseScene
  ],
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 } }
  }
};

new Phaser.Game( config );