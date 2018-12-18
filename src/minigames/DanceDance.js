import { Difficulty, MiniGame } from './';

/**
 * The Dance Dance mini game is like DDR and the player needs to complete the
 * arrow combination in order before time expires. If a mistake is made or time
 * runs out, the player loses.
 */
export default class DanceDance extends MiniGame {
  /**
   * Creates a DanceDance mini game object
   * @constructor
   */
  constructor() {
    super( 'DanceDance' );
    
    /**
     * The name of the minigame
     * @type {string}
     */
    this.name = 'Dance Dance';
    
    /**
     * The description of the minigame
     * @type {string}
     */
    this.description = 'The player has to do the arrow combination displayed ' +
      'before the time runs out';
    
    /**
     * The text displayed quickly to the user before the minigame begins
     * @type {string}
     */
    this.text = 'Dance!';
    
    /**
     * The time duration of the mini game in ms
     * @type {number}
     */
    this.duration = 3000;
    
    /**
     * The length of the combo required to successfully complete the minigame
     * @type {number}
     */
    this.comboLength = -1;
    
    /**
     * The key combination required to complete the minigame
     * @type {Phaser.Input.Keyboard.KeyCombo}
     */
    this.combo = null;
    
    /**
     * The text displayed to the user to show the combination required
     * @type {Phaser.GameObjects.Text}
     */
    this.danceText = null;
    
    /**
     * The number of times the key was pressed during the minigame
     * @type {number}
     */
    this.inputCount = 0;
  }

  /**
   * @override
   */
  create( data ) {
    super.create( data );

    // Set combo length
    switch ( this.difficulty ) {
      case Difficulty.INTERMEDIATE:
        this.comboLength = 5;
        break;
      case Difficulty.ADVANCED:
        this.comboLength = 6;
        break;
      case Difficulty.EASY:
      default:
        this.comboLength = 4;
        break;
    }

    // Create Key Combination
    const dirs = [ 'W', 'A', 'S', 'D' ];
    const keyCombo = [];
    while ( keyCombo.length < this.comboLength ) {
      keyCombo.push( dirs[ Math.floor( Math.random() * 4 ) ] );
    }
    this.combo = this.input.keyboard.createCombo(
      keyCombo, { resetOnWrongKey: true }
    );
    
    // On combo match, win mini game
    this.input.keyboard.on( 'keycombomatch', () => {
      this.win();
    } );

    // Each time player hits a key, inputCount will be increased
    this.input.keyboard.on( 'keydown', () => {
      this.inputCount++;
    } );

    // Create the display text for the combination
    if ( this.difficulty === Difficulty.ADVANCED ) {
      keyCombo.reverse();
    }
    const txt = keyCombo.map( ( l ) => {
      switch ( l ) {
        case 'W':
          return '↑';
        case 'A':
          return '←';
        case 'S':
          return '↓';
        case 'D':
          return '→';
        default:
          return '';
      }
    } ).join( ' ' );
    this.danceText = this.add.text(
      this.w / 2,
      this.h / 2,
      txt, {
        fontSize: '40px',
        fill: '#FFF'
      }
    );
    this.danceText.setPosition(
      this.danceText.x - this.danceText.width / 2,
      this.danceText.y - this.danceText.height / 2
    );
    this.danceText.setVisible( false );
  }

  /**
   * @see MiniGame#startGame
   */
  startGame() {
    super.startGame();
    this.inputCount = 0;
    this.danceText.setVisible( true );
  }

  /**
   * @override
   */
  updateMiniGame( time, delta ) {
    if ( this.inputCount !== this.combo.index ) {
      this.lose();
    }
  }

  /**
   * @override
   */
  reset() {
    this.combo.destroy();
    super.reset();
  }
}