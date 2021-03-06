import Item from './Item';
import { ItemType } from './';

/**
 * Slows down the timer in the mini game that is currently being played. Can
 * only be used once.
 */
export default class Timelapse extends Item {
  /**
   * @param {number} x The x-position of the item
   * @param {number} y The y-position of the item
   * @param {Phaser.Scene} scene The current scene
   */
  constructor( x, y, scene ) {
    super( { x: x, y: y, scene: scene, key: 'timelapse' } );

    /**
     * This item is a minigame item
     * @type {ItemType}
     */
    this.itemType = ItemType.MINIGAME;
    
    /**
     * The name of the item
     * @type {string}
     */
    this.name = 'Timelapse';
  }

  /**
   * Uses the item to slow down the minigame
   * @param {ItemUseConfig} config The configuration passed in
   */
  use( config ) {
    const minigame = config.minigame;
    minigame.timeScale = 0.5;
  }
}