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
    this.gameTitle = 'Micrungeon';
    this.version = '0.1.0';
    this.index = 0;
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
    this.scene.setVisible( false );
    this.keys = KeyBinding.createKeys( this, [ 'up', 'down', 'space' ] );
    const { width, height } = this.game.config;

    // Background
    const background = this.add.graphics();
    background.fillStyle( 0x333333, 1 );
    background.fillRect( 0, 0, width, height );

    // Version Text
    const versionText = this.add.text( 10, height - 22,
      `v${this.version}`, { fontSize: '12px', color: '#FFF' } );
    versionText.setPosition( width - versionText.width - 10, height - 22 );

    // Title Text
    WebFont.load( {
      google: {families: [ 'Rye' ]},
      active: () => {
        const titleText = this.add.text( 10, 10, this.gameTitle, {
          fontSize: '64px',
          color: '#FFF',
          fontFamily: 'Rye'
        } );
        titleText.setShadow( 0, 2, '#000', 10 );
        this.scene.setVisible( true );
      }
    } );

    // Menu Options
    this.options = [
      this.add.text( 20, 0, 'Play', { fontSize: '30px', color: '#FFF' } ),
      this.add.text( 20, 0, 'Options', { fontSize: '30px', color: '#FFF' } ),
      this.add.text( 20, 0, 'Credits', { fontSize: '30px', color: '#FFF' } )
    ];

    for ( let i = 0; i < this.options.length; i++ ) {
      const opt = this.options[ i ];
      opt.setShadow( 0, 2, '#000', 5 );
      opt.setInteractive( { useHandCursor: true } );
      opt.setPosition( 20, 120 + ( opt.height + 20 ) * i );
      opt.on( 'pointerover', () => { this.index = i; } );
      opt.on( 'pointerdown', () => { this.selectOption(); } );
    }
  }

  /**
   * @override
   */
  update( time, delta ) {
    // Key UP
    if ( this.keys.up.isDown ) {
      this.index--;
      if ( this.index < 0 ) {
        this.index = this.options.length - 1;
      }
      this.input.keyboard.resetKeys();
    }
    else if ( this.keys.down.isDown ) {
      this.index = ( this.index + 1 ) % this.options.length;
      this.input.keyboard.resetKeys();
    }
    else if ( this.keys.space.isDown ) {
      this.selectOption();
      this.input.keyboard.resetKeys();
    }

    // Change option alpha based on selected index
    for ( let i = 0; i < this.options.length; i++ ) {
      if ( i === this.index ) {
        this.options[ i ].setAlpha( 1 );
      }
      else {
        this.options[ i ].setAlpha( 0.5 );
      }
    }
  }

  /**
   * Performs an action based on the current selected index
   */
  selectOption() {
    switch ( this.index ) {
      case 0:
        this.scene.start( 'GameScene' );
        break;
    }
  }
}