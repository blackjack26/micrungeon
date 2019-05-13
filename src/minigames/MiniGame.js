import { ItemType } from '../entity/items';
import KeyBinding from '../util/KeyBinding';
import { Difficulty } from '../globals';

/**
 * Base class for all mini games
 */
export default class MiniGame extends Phaser.Scene {
  /**
   * Creates a mini game within the current scene
   * @constructor
   * @param {string} key - The scene key
   */
  constructor( key ) {
    super( { key: key } );
    
    /**
     * The scene key
     * @type {string}
     */
    this.key = key;
    
    /**
     * The name of the minigame
     * @type {string}
     */
    this.name = 'Default MiniGame';
    
    /**
     * The description of the minigame
     * @type {string}
     */
    this.description = 'Default description';

    /**
     * The text displayed quickly to the user before the minigame begins
     * @type {string}
     */
    this.text = 'Default!';

    /**
     * The time duration of the mini game in ms
     * @type {number}
     */
    this.duration = -1;
    
    /**
     * The amount of time elapsed in ms since the minigame started
     * @type {number}
     */
    this.elapsedTime = 0;
    
    /**
     * Whether or not the minigame has started
     * @type {boolean}
     */
    this.started = false;
    
    /**
     * The horizontal position of the minigame window
     * @type {number}
     */
    this.x = 0;
    
    /**
     * The vertical position of the minigame window
     * @type {number}
     */
    this.y = 0;
    
    /**
     * The difficulty of the minigame
     * @type {Difficulty}
     */
    this.difficulty = Difficulty.EASY;
    
    /**
     * The time scale applied to the duration of the minigame
     * @type {number}
     */
    this.timeScale = 1;
    
    /**
     * The parent scene that created this minigame
     * @type {Phaser.Scene}
     */
    this.parent = null;
    
    /**
     * The width of the game
     * @type {number}
     */
    this.w = -1;
    
    /**
     * The height of the game
     * @type {number}
     */
    this.h = -1;
    
    /**
     * The text graphic displayed to the user quickly before the minigame starts
     * @type {Phaser.GameObjects.Text}
     */
    this.alertText = null;
    
    /**
     * The ID of the timeout used for starting the minigame
     * @type {number}
     */
    this.startTimeout = -1;
    
    /**
     * The graphics bar used to display the amount of time left in the minigame
     * @type {Phaser.GameObjects.Graphics}
     */
    this.timerBar = null;
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
    background.fillStyle( 0x333333, 0.9 );
    background.fillRect( this.x, this.y, this.w, this.h );