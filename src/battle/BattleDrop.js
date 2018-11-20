import Random from '../util/Random';
import Injection from '../entity/items/Injection';

/**
 * Contains methods for dropping items during / after battle
 */
export default class BattleDrop {
  /**
   * @param {number} x The x-position of the item
   * @param {number} y The y-position of the item
   * @param {Phaser.Scene} scene The current scene
   */
  static drop( x, y, scene ) {
    const r = new Random();
    const num = r.randInt( 0, 100 );
    // 40% injection
    if ( num < 40 ) {
      new Injection( x, y, scene );
    }
  }
}