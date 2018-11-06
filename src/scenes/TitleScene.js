import KeyBinding from '../util/KeyBinding';

/**
 * The title scene displays the main menu for the player to choose what they
 * would like to do
 */
export default class TitleScene extends Phaser.Scene {
  /**
   * Initializes the title scene
   */
  constructor() {
    super( { key: 'TitleScene' } );
  }

  /**
   * @override
   */
  preload() {

  }

  /**
   * @override
   */
  create() {
    const logo = this.add.image( 400, 150, 'logo' );
    this.tweens.add( {
      targets: logo,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 2000,
      ease: 'Power2',
      yoyo: true,
      loop: -1
    } );

    this.keys = KeyBinding.createKeys( this, [ 'up' ] );
  }

  /**
   * @override
   */
  update( time, delta ) {
    if ( this.keys.up.isDown && this.keys.up.repeats === 1 ) {
      this.scene.start( 'GameScene' );
    }
  }
}