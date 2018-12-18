import Item from './Item';
import { ItemType } from './';

/**
 * This is a health booster that can only be used when the player has health
 * below their maximum health. If the player's health is already full, the
 * player is injured (what a twisted society we live in)
 */
export default class Injection extends Item {
  /**
   * @constructor
   * @param {number} x The x-position of the item
   * @param {number} y The y-position of the item
   * @param {Phaser.Scene} scene The current scene
   */
  constructor( x, y, scene ) {
    super( { x: x, y: y, scene: scene, key: 'injection' } );
    
    /**
     * The amount to heal the player upon use
     * @type {number}
     */
    this.amount = 5;

    /**
     * This item can be used anywhere
     * @type {ItemType}
     */
    this.itemType = ItemType.ANY;

    /**
     * The name of the item
     * @type {string}
     */
    this.name = 'Injection';
  }

  /**
   * Uses the item to either heal or hurt the player
   * @param {ItemUseConfig} config The configuration passed in
   */
  use( config ) {
    const player = config.player;
    if ( player.health === player.maxHealth ) {
      player.injure( this.amount );
      player.scene.cameras.main.shake( 200, 0.0025 );
      player.scene.cameras.main.flash( 200, 150, 0, 0 );
    }
    else {
      player.heal( this.amount );
    }
  }
}