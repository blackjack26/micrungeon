import Item from './Item';
import { ItemType } from './';

/**
 * This is a health booster that can only be used when the player has health
 * below their maximum health. If the player's health is already full, the
 * player is injured (what a twisted society we live in)
 */
export default class Injection extends Item {
  /**
   * @param {number} x The x-position of the item
   * @param {number} y The y-position of the item
   * @param {Phaser.Scene} scene The current scene
   */
  constructor( x, y, scene ) {
    super( {x: x, y: y, scene: scene, key: 'injection'} );
    this.amount = 5;
    this.itemType = ItemType.ANY;
    this.name = 'Injection';
  }

  /**
   * Uses the item to either heal or hurt the player
   * @param  {object} config The configuration passed in
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