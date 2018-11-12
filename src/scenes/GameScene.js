import {
  DanceDance,
  Difficulty
} from '../minigames';
import KeyBinding from '../util/KeyBinding';
import Dungeon from '../dungeon/Dungeon';

/**
 * The game scene is the main scene used when the player is in actual game play.
 * All mini game and dungeon gameplay will be from this scene.
 */
export default class GameScene extends Phaser.Scene {
  /**
   * Initializes the game scene
   */
  constructor() {
    super( { key: 'GameScene' } );
  }

  /**
   * @override
   */
  preload() {
    // Load all mini games here, possibly move to BootScene
    this.scene.add( 'DanceDance', DanceDance );
    this.dungeon = new Dungeon();
  }

  /**
   * @override
   */
  create() {
    this.keys = KeyBinding.createKeys( this, [ 'up', 'left', 'right' ] );
    this.add.text( 16, 16, 'Game Scene', { fontSize: '20px', color: '#FFF' } );
  }

  /**
   * @override
   */
  update( time, delta ) {
    // Example code, remove later
    if ( this.keys.up.isDown && this.keys.up.repeats === 1 ) {
      this.playMinigame( 'DanceDance' );
    }
    else if ( this.keys.left.isDown && this.keys.left.repeats === 1 ) {
      this.playMinigame( 'DanceDance', Difficulty.INTERMEDIATE );
    }
    else if ( this.keys.right.isDown && this.keys.right.repeats === 1 ) {
      this.playMinigame( 'DanceDance', Difficulty.ADVANCED );
    }
  }

  /**
   * Opens the given mini game and pauses the game until mini game is over
   * @param {string} name The name of the mini game
   * @param {number} difficulty The difficulty of the mini game
   */
  playMinigame( name, difficulty = Difficulty.EASY ) {
    this.currentMinigame = this.scene.get( name );
    if ( !this.currentMinigame ) {
      return;
    }

    this.scene.launch( name, {
      parent: this,
      difficulty: difficulty
    } );
    this.scene.bringToTop( name );
    this.scene.pause();
    console.log( 'Play MiniGame' );
  }

  /**
   * Stops the current mini game and resumes the game
   * @param {object} result The result of the mini game
   */
  continueCombat( result ) {
    console.log( 'MiniGame Results:', result );
    this.scene.stop( this.currentMinigame.key );
    this.input.keyboard.resetKeys();
    this.scene.resume();
    console.log( 'Resume Combat' );
  }
}