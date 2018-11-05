const Difficulty = {
  EASY: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3
};

/**
 * Base class for all mini games
 */
class MiniGame extends Phaser.Scene {
  /**
   * Creates a mini game within the current scene
   * @param {string} key - The scene key
   */
  constructor( key ) {
    super( { key: key } );
    this.key = key;
    this.name = 'Default MiniGame';
    this.description = 'Default description';
    this.text = 'Default!';
    this.duration = -1;
    this.elapsedTime = 0;
    this.started = false;
    this.x = 25;
    this.y = 25;
    this.difficulty = Difficulty.EASY;
  }

  /**
   * Initializes data when the mini game is created
   * @param {object} data - information passed from parent scene
   */
  create( data ) {
    this.parent = data.parent;
    this.difficulty = data.difficulty;
    this.w = this.sys.game.config.width;
    this.h = this.sys.game.config.height;

    const background = this.add.graphics();
    background.fillStyle( 0x999999, 1 );
    background.fillRect( this.x, this.y, this.w - 50, this.h - 50 );

    this.add.text( this.x + 16, this.y + 16, this.name,
      { fontSize: '24px', fill: '#FFF' } );
    this.add.text( this.x + 16, this.y + 40, this.description,
      { fontSize: '12px', fill: '#FFF' } );

    this.alertText = this.add.text( this.w / 2, this.h / 2, this.text,
      { fontSize: '40px', fill: '#FFF' } );
    this.alertText.setPosition(
      this.alertText.x - this.alertText.width / 2,
      this.alertText.y - this.alertText.height / 2
    );

    // Show text for 1 second, then start mini game
    setTimeout( () => {
      this.startGame();
    }, 1000 );

    this.timerBar = this.add.graphics();
    this.timerBar.fillStyle( 0xFFFFFF, 0.4 );
    this.timerBar.fillRect( this.x, this.h - 10 - this.y, this.w - 50, 10 );
  }

  /**
   * Updates every tick of the game loop
   * @param {number} time The current time
   * @param {number} delta The delta time in ms since the last frame
   */
  update( time, delta ) {
    if ( this.started ) {
      if ( this.duration !== -1 ) {
        if ( this.elapsedTime > this.duration ) {
          this.lose();
        }
        this.elapsedTime += delta;

        this.timerBar.clear();
        this.timerBar.fillStyle( 0xFFFFFF, 0.4 );
        this.timerBar.fillRect( this.x,
          this.h - 10 - this.y,
          this.w - ( ( this.w - 50 ) * ( this.elapsedTime / this.duration ) )
          - 50,
          10
        );
      }
      this.updateMiniGame( time, delta );
    }
  }

  /**
   * Called right before the mini game starts
   */
  startGame() {
    this.alertText.destroy();
    this.started = true;
  }

  /**
   * This method will only be updated once the mini game has officially started.
   * The mini game will start after the alert text disappears.
   * @param  {number} time  The current time
   * @param  {number} delta The delta time in ms since the last frame
   */
  updateMiniGame( time, delta ) {
    // NOTE: Override this in mini game classes
    throw new Error( 'updateMiniGame() must be overriden' );
  }

  /**
   * Called when the mini game has been won. Will redirect back to combat.
   */
  win() {
    const timeLeft = this.duration - this.elapsedTime;

    this.reset();
    this.parent.continueCombat( {
      win: true,
      damage: Math.ceil( timeLeft / 1000 ) * this.difficulty
    } );
  }

  /**
   * Called when the mini game has been lost. Will redirect back to combat.
   */
  lose() {
    this.reset();
    this.parent.continueCombat( {
      win: false,
      damage: 0
    } );
  }

  /**
   * Resets the mini game to its original state to be played again.
   */
  reset() {
    this.timerBar.destroy();
    this.elapsedTime = 0;
    this.started = false;
  }
}

module.exports = {
  MiniGame: MiniGame,
  Difficulty: Difficulty
};