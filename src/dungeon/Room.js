import Tiles from './Tiles';
import { RoomType, Edge } from '../globals';
import Random from '../util/Random';
import { Enemy } from '../entity';

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
    this.type = RoomType.BATTLE;
    this.entered = false;

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
   */
  updateDoorPositions() {
    this.doors = [];
    for ( let y = 0; y < this.height; y++ ) {
      for ( let x = 0; x < this.width; x++ ) {
        if ( this.tiles[ y ][ x ] === Tiles.DOOR ) {
          let edge = Edge.NONE;
          if ( y === 0 ) {
            edge = Edge.TOP;
          }
          else if ( y === this.height - 1 ) {
            edge = Edge.BOTTOM;
          }
          else if ( x === 0 ) {
            edge = Edge.LEFT;
          }
          else if ( x === this.width - 1 ) {
            edge = Edge.RIGHT;
          }
          this.doors.push( { x: x, y: y, edge: edge } );
        }
      }
    }
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
   * Determines if the given coordinates is on the edge of the room
   * @param {number} x The x-coordinate (in tile space)
   * @param {number} y The y-coordinate (in tile space)
   * @return {number} The Edge the coordinate lies on
   */
  getEdge( x, y ) {
    if ( y === this.y ) {
      return Edge.TOP;
    }
    else if ( y === this.y + this.height - 1 ) {
      return Edge.BOTTOM;
    }
    else if ( x === this.x ) {
      return Edge.LEFT;
    }
    else if ( x === this.x + this.width - 1 ) {
      return Edge.RIGHT;
    }
    return Edge.NONE;
  }

  /**
   * [spawnEnemies description]
   * @param  {[type]} scene [description]
   */
  spawnEnemies( scene ) {
    if ( this.type !== RoomType.BATTLE ) {
      return;
    }

    const rand = new Random();
    for ( let i = 0; i < rand.randInt( 1, 3 ); i++ ) {
      const x = scene.map.tileToWorldX(
        rand.randInt( this.x + 2, this.x + this.width - 2 )
      );
      const y = scene.map.tileToWorldY(
        rand.randInt( this.y + 2, this.y + this.height - 2 )
      );
      const enemy = new Enemy( {
        scene: scene,
        key: 'enemy',
        x: x,
        y: y
      } );
      enemy.miniGames.push( 'DanceDance' ); // TODO: Change based on enemy type
      enemy.setHealth( 3 ); // TODO: Change based on enemy type
      enemy.setInteractive( { useHandCursor: true } );
      scene.enemyGroup.add( enemy );
    }
  }
}

export {
  Room,
  RoomType
};