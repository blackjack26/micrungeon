import { ItemType } from './';

/**
 * The player's inventory which holds the items the player picks up
 */
export default class Inventory {
  /**
   *
   */
  constructor() {
    this.items = [];
    this.passive = [];
    this.capacity = 8;
  }

  /**
   * Adds an item to the inventory
   * @param {Item} item The item to add
   * @return {boolean} True if the item could be added
   */
  addItem( item ) {
    if ( item.itemType === ItemType.PASSIVE ) {
      this.passive.push( item.constructor.name );
      return true;
    }
    else {
      this.items.push( item.constructor.name );
      return true;
    }
    return false;
  }
}