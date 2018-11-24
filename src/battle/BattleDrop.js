import Random from '../util/Random';
import { Injection, Timelapse, BugSpray } from '../entity/items';

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
    const r = new Random( new Date().getTime() );
    const num = r.randInt( 0, 100 );

    // 40% injection
    if ( num < 40 ) {
      new Injection( x, y, scene );
    }
    // 10% timelapse
    else if ( num >= 40 && num < 50 ) {
      new Timelapse( x, y, scene );
    }
    // 15% bug spray
    else if ( num >= 50 && num < 65 ) {
      new BugSpray( x, y, scene );
    }
  }
}