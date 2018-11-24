import Random from '../../util/Random';
import { VorpalSword } from './';

/**
 * Contains methods for dropping items in a room
 */
export default class ItemDrop {
  /**
   * @param {number} x The x-position of the item
   * @param {number} y The y-position of the item
   * @param {Phaser.Scene} scene The current scene
   */
  static drop( x, y, scene ) {
    const r = new Random( new Date().getTime() );
    const num = r.randInt( 0, 100 );

    // 8% VorpalSword
    if ( num < 8 ) {
      new VorpalSword( x, y, scene );
    }
  }
}