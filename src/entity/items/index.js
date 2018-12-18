import Injection from './Injection';
import Timelapse from './Timelapse';
import Inventory from './Inventory';
import VorpalSword from './VorpalSword';
import BugSpray from './BugSpray';

/**
 * Contains all of the items available in the game
 * @type {Object}
 */
const items = { Injection, Timelapse, VorpalSword, BugSpray };

/**
 * Enum used to describe item types
 */
const ItemType = {
  ANY: 0,
  BATTLE: 1,
  MINIGAME: 2,
  PASSIVE: 3
};

/**
 * Creates an item instance from the name
 * @param {string} name The name of the item class
 * @return {Item} an instance of the Item
 */
function itemClass( name ) {
  return items[ name ];
}

export {
  ItemType,
  Injection,
  Inventory,
  Timelapse,
  VorpalSword,
  BugSpray,
  itemClass
};