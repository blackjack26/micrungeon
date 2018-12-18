import { ItemType } from './';

/**
 * The player's inventory which holds the items the player picks up
 */
export default class Inventory {
  /**
   * @constructor
   */
  constructor() {
    /**
     * The items picked up by the player in the game (excludes passive items)
     * @type {Array.<Item>}
     */
    this.items = [];
    
    /**
     * The passive items picked up by the player in the game
     * @type {Array.<Item>}
     */
    this.passive = [];
    
    /**
     * The capacity of the inventory (for non-passive items)
     * @type {number}
     */
    this.capacity = 8;
  }

  /**
   * Adds an item to the inventory
   * @param {Item} item The item to add
   * @return {boolean} True if the item could be added
   */
  addItem( item ) {
    // Passive Items
    if ( item.itemType === ItemType.PASSIVE ) {
      this.passive.push( item.constructor.name );
      return true;
    }
    
    // Non-Passive Items
    if ( this.items.length >= this.capacity ) {
      return false;
    }
    this.items.push( item.constructor.name );
    return true;
  }
}