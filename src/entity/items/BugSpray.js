import Item from './Item';
import { ItemType } from './index';
import Message from '../../scenes/elements/Message';

/**
 * If used in the dungeon, battle rooms have no enemies (wears off in 3 rooms).
 * If used in battle, the battle ends (one time use). Excludes boss fights
 */
export default class BugSpray extends Item {
  /**
   * @constructor
   * @param {number} x The x-position of the item
   * @param {number} y The y-position of the item
   * @param {Phaser.Scene} scene The current scene
   */
  constructor( x, y, scene ) {
    super( { x: x, y: y, scene: scene, key: 'bug_spray' } );
    
    /**
     * This item can be used anywhere
     * @type {ItemType}
     */
    this.itemType = ItemType.ANY;
    
    /**
     * The name of the item
     * @type {string}
     */
    this.name = 'Bug Spray';
  }

  /**
   * Uses the item to either end the battle, or prevent battles for 3 rooms
   * @param {ItemUseConfig} config The configuration
   */
  use( config ) {
    // Used in battle
    if ( config.battle != null ) {
      Message.status( 'The bug spray knocked out the enemies', config.scene );
      config.battle.slayAll();
    }
    // Used while exploring
    else if ( config.scene ) {
      Message.status( 'Bug spray has been applied', config.scene );
      config.scene.preventSpawn = true;
      config.scene.roomCooloffs[ 'bug_spray' ] = {
        remaining: 3,
        callback: () => {
          config.scene.preventSpawn = false;
          Message.status( 'The bug spray has worn off', config.scene );
        }
      };
    }
  }
}