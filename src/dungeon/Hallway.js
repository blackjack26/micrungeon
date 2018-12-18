import { Room, RoomType } from './Room';
import Tiles from './Tiles';
import { Orientation } from '../globals';

/**
 * A hallway is a simplified room that is used as a connector between two other
 * rooms.
 */
export default class Hallway extends Room {
  /**
   * @constructor
   * @param {number} width The width of the hallway
   * @param {number} height The height of the hallway
   */
  constructor( width, height ) {
    super( width, height );
    
    /**
     * The type of room
     * @type {RoomType}
     */
    this.type = RoomType.HALLWAY;
  }

  /**
   * Creates a Hallway from the given two doors
   * @param {TilePosition} door1 The first door
   * @param {TilePosition} door2 The second door
   * @return {Hallway} The constructed hallway
   */
  static fromDoors( door1, door2 ) {
    let hallway;
    if ( door1.x === door2.x ) { // Vertical Hallway
      hallway = new Hallway( 3, Math.abs( door1.y - door2.y ) - 1 );
      hallway.setPosition( door1.x - 1, Math.min( door1.y, door2.y ) + 1 );

      for ( let r = 0; r < hallway.height; r++ ) {
        hallway.tiles[ r ][ 1 ] = Tiles.FLOOR;
      }

      hallway.orientation = Orientation.VERTICAL;
    }
    else if ( door1.y === door2.y ) { // Horizontal Hallway
      hallway = new Hallway( Math.abs( door1.x - door2.x ) - 1, 3 );
      hallway.setPosition( Math.min( door1.x, door2.x ) + 1, door1.y - 1 );

      for ( let c = 0; c < hallway.width; c++ ) {
        hallway.tiles[ 1 ][ c ] = Tiles.FLOOR;
      }

      hallway.orientation = Orientation.HORIZONTAL;
    }
    return hallway;
  }
}