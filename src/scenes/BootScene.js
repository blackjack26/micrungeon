import { createAnimations } from '../util/Animation';

/**
 * The boot scene, or splash screen, is used to initialize most of the game
 * objects and images. The preload method will be mostly utilized. Once all
 * assets are loaded, the title scene is started.
 */
export default class BootScene extends Phaser.Scene {
  /**
   * Initializes the boot scene
   */
  constructor() {
    super( { key: 'BootScene' } );
  }

  /**
   * @override
   */
  preload() {
    const progress = this.add.graphics();

    // Register a load progress event to show a load bar
    this.load.on( 'progress', ( value ) => {
      progress.clear();
      progress.fillStyle( 0xFFFFFF, 1 );
      progress.fillRect( 0, this.sys.game.config.height
        / 2, this.sys.game.config.width * value, 60 );
    } );

    // Register a load complete event to launch the title screen when all
    // files are loaded
    this.load.on( 'complete', () => {
      createAnimations( this );
      progress.destroy();
      this.scene.start( 'TitleScene' );
    } );

    // Load all assets here
    this.load.image( 'logo', 'assets/logo.png' );
    this.load.script( 'webfont',
      'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js' );
    this.load.image( {
      key: 'dungeon_tiles',
      url: 'assets/dungeon-tileset-ext.png',
      normalMap: 'assets/dungeon-tileset-ext_n.png'
    } );

    // TODO: DELETE THIS SAMPLE
    this.load.atlas( 'sample-sprites', 'assets/sample-sprites.png',
      'assets/sample-sprites.json' );
  }
}