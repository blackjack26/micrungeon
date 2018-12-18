import KeyBinding from '../util/KeyBinding';

/**
 * The pause scene is the scene displayed when hitting the ESC key in the game
 */
export default class PauseScene extends Phaser.Scene {
  /**
   * @constructor
   */
  constructor() {
    super( { key: 'PauseScene' } );
    
    /**
     * The parent scene used to initiate this scene
     * @type {Phaser.Scene}
     */
    this.parent = null;
  }

  /**
   * Initializes data when the pause scene is created
   * @param {object} data - information passed from parent scene
   */
  create( data ) {
    this.parent = data.parent;
    
    /**
     * A collection of keys available for use in the inventory
     * @type {Object}
     */
    this.keys = KeyBinding.createKeys( this,
      [ 'up', 'left', 'right', 'down', 'space', 'pause' ] );

    const { width, height } = this.game.config;

    // Background
    const background = this.add.graphics();
    background.fillStyle( 0x333333, 0.9 );
    background.fillRect( 0, 0, width, height );

    WebFont.load( {
      google: { families: [ 'Rye' ] },
      active: () => {
        const titleText = this.add.text( width / 2, 10, 'Pause Menu', {
          fontSize: '40px',
          color: '#FFF',
          fontFamily: 'Rye'
        } );
        titleText.setShadow( 0, 2, '#000', 10 );
        titleText.setPosition( width / 2 - titleText.width / 2,
          titleText.height / 2 + 10 );

        const controls = [
          'W - Move Up',
          'A - Move Left',
          'S - Move Down',
          'D - Move Right',
          'E - Inventory',
          'Space - Select',
          'Escape - Pause',
          '',
          'Left Mouse - Select'
        ];
        controls.forEach( ( control, index ) => {
          this.add.text( 40, 100 + 30 * index, control, {
            fontSize: '24px',
            color: '#FFF'
          } ).setShadow( 0, 2, '#000', 10 );
        } );
      }
    } );
  }

  /**
   * Updates every tick of the game loop
   * @param {number} time The current time
   * @param {number} delta The delta time in ms since the last frame
   */
  update( time, delta ) {
    if ( this.keys.pause.isDown ) {
      this.parent.unpause();
      this.input.keyboard.resetKeys();
    }
  }
}