import Item from './Item';
import { ItemType } from './';

/**
 * 5% chance that winning a microgame will instantly kill a non-boss enemy.
 */
export default class VorpalSword extends Item {
  /**
   * @param {number} x The x-position of the item
   * @param {number} y The y-position of the item
   * @param {Phaser.Scene} scene The current scene
   */
  constructor( x, y, scene ) {
    super( {x: x, y: y, scene: scene, key: 'vorpal_sword'} );
    this.itemType = ItemType.PASSIVE;
    this.name = 'Vorpal Sword';
  }

  /**
   * @override
   */
  onCollide( item, player ) {
    player.criticalChance += 5;
    super.onCollide( item, player );
  }
}