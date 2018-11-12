import Tiles from './Tiles';

const RoomType = {
  UNSET: -1,
  START: 0,
  BATTLE: 1,
  ITEM: 2,
  HALLWAY: 3,
  END: 4
};

/**
 * Each room in a dungeon has walls, floor, and doors. Also entities live
 * within these rooms. The entities defined for each room will be random
 * and depend on the level.
 */
class Room {
  /**
   * @param {number} width The width of the room
   * @param {number} height The height of the room
   */
  constructor( width, height ) {
    this.width = width;
    this.height = height;
    this.area = width * height;

    this.setPosition( 0, 0 );

    this.id = -1;
    this.type = RoomType.UNSET;

    this.doors = [];
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
    this.x = x;
    this.y = y;
    this.left = x;
    this.right = x + this.width - 1;
    this.top = y;
    this.bottom = y + this.height - 1;
    this.centerX = x + Math.floor( this.width / 2 );
    this.centerY = y + Math.floor( this.height / 2 );
  }

  /**
   * Finds all the doors in the room and returns a list of their positions
   * @return {Array} The list of door positions
   */
  getDoorPositons() {
    const doors = [];
    for ( let r = 0; r < this.height; r++ ) {
      for ( let c = 0; c < this.width; c++ ) {
        if ( this.tiles[ r ][ c ] === Tiles.DOOR ) {
          doors.push( { x: c, y: r } );
        }
      }
    }
    return doors;
  }

  /**
   * Checks if the current room overlaps the given room
   * @param {Room} room The room to check overlap with
   * @return {boolean} True if the rooms overlap
   */
  overlaps( room ) {
    return this.overlapsX( room ) && this.overlapsY( room );
  }

  /**
   * Checks if the current room overlaps x-coordinates with the given room
   * @param {Room} room The room to check overlap with
   * @return {boolean} True if the rooms overlap x-coordinates
   */
  overlapsX( room ) {
    return !( this.right < room.left || this.left > room.right );
  }

  /**
   * Checks if the current room overlaps y-coordinates with the given room
   * @param {Room} room The room to check overlap with
   * @return {boolean} True if the rooms overlap y-coordinates
   */
  overlapsY( room ) {
    return !( this.bottom < room.top || this.top > room.bottom );
  }

  /**
   * Checks to see if a door is in the corner of a room
   * @param {object} door The door to a room
   * @return {boolean} True if the door is on the corner of the room
   */
  isCorner( door ) {
    if ( door.x === this.x || door.x === this.x + this.width - 1 ) {
      if ( door.y === this.y || door.y === this.y + this.height - 1 ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Determines if the current room is connected to the given room
   * @param {Room} room The room to check a connection with
   * @return {boolean} True if the rooms connect through a door
   */
  isConnectedTo( room ) {
    for ( const door of this.getDoorPositons() ) {
      // move the door into "world space" using current room's position
      door.x += this.x;
      door.y += this.y;

      // move the door into other room's space by subtracting room's position
      door.x -= room.x;
      door.y -= room.y;

      // make sure the position is valid for given room's tile array
      if ( door.x < 0 || door.x > room.width - 1 ||
        door.y < 0 || door.y > room.height - 1 ) {
        continue;
      }

      // see if the tile is a door; if so, then current room and given room
      // are connected
      if ( room.tiles[ door.y ][ door.x ] === Tiles.DOOR ) {
        return true;
      }
    }
    return false;
  }
}

export {
  Room,
  RoomType
};