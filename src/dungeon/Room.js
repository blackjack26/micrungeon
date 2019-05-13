import Tiles from './Tiles';
import { Edge, RoomType } from '../globals';
import { Enemy } from '../entity';
import ItemDrop from '../entity/items/ItemDrop';

/**
 * Describes how enemies will spawn based on the entry direction of the player
 * @type {Map.<Direction,Map.<number, object>>}
 */
const enemySpawnMap = {
  0: {
    2: {
      start: Math.PI / 4,
      inc: Math.PI / 2
    },
    3: {
      start: Math.PI / 4,
      inc: Math.PI / 4
    },
    4: {
      start: Math.PI / 8,
      inc: Math.PI / 4
    }
  },
  1: {
    2: {
      start: 3 * Math.PI / 4,
      inc: Math.PI / 2
    },
    3: {
      start: 3 * Math.PI / 4,
      inc: Math.PI / 4
    },
    4: {
      start: 5 * Math.PI / 8,
      inc: Math.PI / 4
    }
  },
  2: {
    2: {
      start: -Math.PI / 4,
      inc: -Math.PI / 2
    },
    3: {
      start: -Math.PI / 4,
      inc: -Math.PI / 4
    },
    4: {
      start: -Math.PI / 8,
      inc: -Math.PI / 4
    }
  },
  3: {
    2: {
      start: Math.PI / 4,
      inc: -Math.PI / 2
    },
    3: {
      start: Math.PI / 4,
      inc: -Math.PI / 4
    },
    4: {
      start: 3 * Math.PI / 8,
      inc: -Math.PI / 4
    }
  }
};

/**
 * Each room in a dungeon has walls, floor, and doors. Also entities live within
 * these rooms. The entities defined for each room will be random and depend on
 * the level.
 */
class Room {
  /**
   * @constructor
   * @param {number} width The width of the room
   * @param {number} height The height of the room
   */
  constructor( width, height ) {
    /**
     * The width of the room in tiles
     * @type {number}
     */
    this.width = width;
    
    /**
     * The height of the room in tiles
     * @type {number}
     */
    this.height = height;
    
    /**
     * The area of the room in tiles-squared
     * @type {number}
     */
    this.area = width * height;

    this.setPosition( 0, 0 );

    /**
     * The ID number of the room
     * @type {number}
     */
    this.id = -1;
    
    /**
     * The room type
     * @type {RoomType}
     */
    this.type = RoomType.BATTLE;
    
    /**
     * Whether or not the player has entered this room
     * @type {boolean}
     */
    this.entered = false;

    /**
     * The doors in the room
     * @type {Array.<Door>}
     */
    this.doors = [];
    
    /**
     * The tiles in the room
     * @type {Array.<Tiles>}
     */
    this.tiles = [];

    // Surround the room with walls, and fill the rest with floors.
    for ( let r = 0; r < this.height; r++ ) {
      const row = [];
      for ( let c = 0; c < this.width; c++ ) {
        if ( r === 0 || r === this.height - 1 ||
          c === 0 || c === this.width - 1 ) {
          row.push( Tiles.WALL );
        }
        else {
          row.push( Tiles.FLOOR );
        }
      }
      this.tiles.push( row );
    }
  }

  /**
   * Sets the position of the room in the dungeon. Also updates positional
   * variables in the room.
   * @param {number} x The x position of the room
   * @param {number} y The y position of the room
   */
  setPosition( x, y ) {
    /**
     * The horizontal position in tiles
     * @type {number}
     */
    this.x = x;
    
    /**
     * The vertical position in tiles
     * @type {number}
     */
    this.y = y;
    
    /**
     * The position of the left edge of the room
     * @type {number}
     */
    this.left = x;

    /**
     * The position of the right edge of the room
     * @type {number}
     */
    this.right = x + this.width - 1;
    
    /**
     * The position of the top edge of the room
     * @type {number}
     */
    this.top = y;
    
    /**
     * The position of the bottom edge of the room
     * @type {number}
     */
    this.bottom = y + this.height - 1;
    
    /**
     * The horizontal center position in tiles
     * @type {number}
     */
    this.centerX = x + Math.floor( this.width / 2 );
    
    /**
     * The vertical center position in tiles
     * @type {number}
     */
    this.centerY = y + Math.floor( this.height / 2 );
  }

  /**
   * Finds all the doors in the room and returns a list of their positions
   */
  updateDoor