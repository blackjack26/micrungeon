import Random from '../util/Random';
import { Room, RoomType } from './Room';
import Tiles from './Tiles';
import Hallway from './Hallway';
import { Direction } from '../globals';

/**
 * The default config for the dungeon
 * @type {DungeonConfig}
 */
const baseConfig = {
  width: 55,
  height: 55,
  randomSeed: undefined,
  doorPadding: 1,
  rooms: {
    width: {
      min: 7,
      max: 21,
      even: false
    },
    height: {
      min: 7,
      max: 17,
      even: false
    },
    maxArea: 250,
    maxRooms: 50
  }
};

/**
 * The minimum length of a hallway between two rooms
 * @type {number}
 */
const MIN_HALL_LENGTH = 2;

/**
 * The maximum length of a hallway between two rooms
 * @type {number}
 */
const MAX_HALL_LENGTH = 8;

/**
 * The minimum width of a room regardless of the dungeon's config
 * @type {number}
 */
const MIN_WIDTH = 3;

/**
 * The minimum height of a room regardless of the dungeon's config
 * @type {number}
 */
const MIN_HEIGHT = 3;

/**
 * The number of times to attempt placing a room in the dungeon
 * @type {number}
 */
const MAX_RETRY_COUNT = 150;

/**
 * The dungeon class to generate dungeon rooms and positions
 */
export default class Dungeon {
  /**
   * @constructor
   * @param {DungeonConfig} config
   */
  constructor( config = {} ) {
    const rooms = config.rooms || {};
    rooms.width = Object.assign( {}, baseConfig.rooms.width, rooms.width );
    rooms.height = Object.assign( {}, baseConfig.rooms.height, rooms.height );
    rooms.maxArea = rooms.maxArea || baseConfig.rooms.maxArea;
    rooms.maxRooms = rooms.maxRooms || baseConfig.rooms.maxRooms;

    // Clamp room size
    rooms.width.min = Math.max( MIN_WIDTH, rooms.width.min );
    rooms.height.min = Math.max( MIN_HEIGHT, rooms.height.min );
    rooms.width.max = Math.max( rooms.width.max, rooms.width.min );
    rooms.height.max = Math.max( rooms.height.max, rooms.height.min );

    // Avoid an impossibly small maxArea
    const minArea = rooms.width.min * rooms.height.min;
    rooms.maxArea = Math.max( rooms.maxArea, minArea );

    /**
     * The number of tiles required on each side of a door
     * @type {number}
     */
    this.doorPadding = config.doorPadding || baseConfig.doorPadding;
    
    /**
     * The width of the dungeon in tiles
     * @type {number}
     */
    this.width = config.width || baseConfig.width;
    
    /**
     * The height of the dungeon in tiles
     * @type {number}
     */
    this.height = config.height || baseConfig.height;
    
    /**
     * The configuration for room generation
     * @type {RoomConfig}
     */
    this.roomConfig = rooms;

    /**
     * The list of rooms in the dungeon
     * @type {Array.<Room>}
     */
    this.rooms = [];
    
    /**
     * The random number generator
     * @private
     * @type {Random}
     */
    this.r = new Random( config.randomSeed );

    /**
     * 2D grid matching map dimensions where every element contains an array of
     * all the rooms in that location
     * @type {Array.<Array.<Array.<Room>>>}
     */
    this.roomGrid = [];

    /**
     * A map of the connections between rooms and hallways
     * @type {Object}
     */
    this.connections = {};
    
    /**
     * The starting room for the dungeon
     * @type {Room}
     */
    this.startRoom = null;

    this.generate();
    
    /**
     * The full map of the dungeon
     * @type {Array.<Array.<Tiles>>}
     */
    this.tiles = this.getTiles();
    
    this.rooms.forEach( ( room ) => room.updateDoorPositions() );
  }

  /**
   * Generates the dungeon and populates it with rooms and hallways
   */
  generate() {
    // Populate empty 2D array
    for ( let r = 0; r < this.height; r++ ) {
      this.roomGrid.push( [] );
      for ( let c = 0; c < this.width; c++ ) {
        this.roomGrid[ r ].push( [] );
      }
    }

    // Seed the map with a starting randomly sized room in the center of the map
    const room = this.createRandomRoom();
    room.setPosition(
      Math.floor( this.width / 2 ) - Math.floor( room.width / 2 ),
      Math.floor( this.height / 2 ) - Math.floor( room.height / 2 )
    );
    this.addRoom( room );
    this.connections[ room.id ] = [];

    // Continue generating rooms until we hit the cap or have hit the maximum
    // iterations (usually due to not being able to fit more rooms)
    let i = this.roomConfig.maxRooms * 5;
    while ( this.rooms.length < this.roomConfig.maxRooms && i > 0 ) {
      this.generateRoom();
      i -= 1;
    }

    // Try to make 2 more random hallways
    this.generateRandomHallways();

    // Select item rooms
    this.selectItemRooms();

    // Pick the starting room
    this.selectStartRoom();

    // Pick the ending room
    this.selectEndRoom();
  }

  /**
   * Creates a room of random width and height
   * @private
   * @return {Room} the created room
   */
  createRandomRoom() {
    let width = 0;
    let height = 0;
    let area = 0;

    // Find width and height using min/max sizes while keeping under maxArea
    const config = this.roomConfig;
    do {
      width = this.r.randInt( config.width.min, config.width.max,
        config.width.even );
      height = this.r.randInt( config.height.min, config.height.max,
        config.height.even );
      area = width * height;
    } while ( area > config.maxArea );

    return new Room( width, height );
  }

  /**
   * Creates a new room and tries to add it to the dungeon
   * @private
   */
  generateRoom() {
    const room = this.createRandomRoom();

    let i = MAX_RETRY_COUNT;
    while ( i > 0 ) {
      // Attempt to find another room to attach this one to
      const result = this.findRoomAttachment( room );
      room.setPosition( result.x, result.y );

      // Try to add it. If successful, add the door and hallway between
      if ( this.addRoom( room ) ) {
        const [ door1, door2 ] =
          this.findNewDoorLocation( room, result );

        // Try to add hallway, if unsuccessful, remove room
        if ( this.addHallway( door1, door2, result.dist ) ) {
          this.connections[ room.id ] = [ result.target.id ];
          this.connections[ result.target.id ].push( room.id );

          this.addDoor( door1 );
          this.addDoor( door2 );
          break;
        }
        else {
          this.removeRoom( room );
        }
      }

      i -= 1;
    }
  }

  /**
   * Generates two random hallways between two random rooms to try and make a
   * loop in the dungeon.
   * @private
   */
  generateRandomHallways() {
    let count = 0;
    let retries = MAX_RETRY_COUNT;

    do {
      retries--;

      /** @type Room */
      const room1 = this.r.randPick(
        this.rooms.filter( ( room ) => !( room instanceof Hallway ) )
      );

      /** @type Room */
      const room2 = this.r.randPick(
        this.rooms.filter(
          ( room ) => !( room instanceof Hallway ) && room.id !== room1.id )
      );

      // Prevent multiple connections between the same room
      if ( this.connections[ room1.id ].indexOf( room2.id ) >= 0 ) {
        continue;
      }

      // Get the direction of the hallway
      let direction;
      if ( room1.overlapsX( room2 ) ) {
        if ( room1.top < room2.top ) {
          direction = Direction.NORTH;
        }
        else {
          direction = Direction.SOUTH;
        }
      }
      else if ( room1.overlapsY( room2 ) ) {
        if ( room1.left < room2.left ) {
          direction = Direction.WEST;
        }
        else {
          direction = Direction.EAST;
        }
      }
      else {
        // No hallway possible
        continue;
      }

      const [ door1, door2 ] = this.findNewDoorLocation( room1,
        {
          target: room2,
          direction: direction
        } );
      const dist = Math.sqrt( Math.pow( door1.x - door2.x, 2 ) +
        Math.pow( door1.y - door2.y, 2 ) );

      // Make sure the doors are not on the corners of the room
      if ( room1.isCorner( door1 ) || room2.isCorner( door2 ) ) {
        continue;
      }

      // Try to add the hallway
      if ( this.addHallway( door1, door2, dist - 1 ) ) {
        this.connections[ room1.id ].push( room2.id );
        this.connections[ room2.id ].push( room1.id );

        this.addDoor( door1 );
        this.addDoor( door2 );
        count++;
      }
    } while ( retries > 0 && count < 3 );
  }

  /**
   * Selects the rooms in the dungeon that are small and places items in them
   * @private
   */
  selectItemRooms() {
    this.rooms
      .filter( ( room ) => room.type !== RoomType.HALLWAY )
      .sort( ( a, b ) => a.area < b.area ? -1 : ( a.area === b.area ? 0 : 1 ) )
      .slice( 0, 5 )
      .forEach( ( room ) => {
        room.type = RoomType.ITEM;
      } );
  }

  /**
   * Selects the starting room
   * @private
   */
  selectStartRoom() {
    /**
     * The starting room
     * @type Room
     */
    let sRoom;
    do {
      sRoom = this.r.randPick(
        this.rooms.filter( ( room ) => !( room instanceof Hallway ) )
      );
    } while ( this.connections[ sRoom.id ].length < 3 );
    sRoom.type = RoomType.START;
    sRoom.tiles[ sRoom.centerY - sRoom.y ][ sRoom.centerX - sRoom.x ]
      = Tiles.START; // TODO: remove, for visualizations
    this.startRoom = sRoom;
  }

  /**
   * Selects the ending room
   * @private
   */
  selectEndRoom() {
    /**
     * The end room
     * @type Room
     */
    let eRoom;
    do {
      eRoom = this.r.randPick(
        this.rooms.filter( ( room ) => !( room instanceof Hallway ) )
      );
    } while ( this.connections[ eRoom.id ].length >= 2 );
    eRoom.type = RoomType.START;
    eRoom.tiles[ eRoom.centerY - eRoom.y ][ eRoom.centerX - eRoom.x ]
      = Tiles.END; // TODO: remove, for visualizations
  }

  /**
   * Adds a room to the current dungeon
   * @private
   * @param {Room} room The room to add
   * @return {boolean} True if the room was successfully added
   */
  addRoom( room ) {
    // if the room won't fit, we don't add it
    if ( !this.canFitRoom( room ) ) {
      return false;
    }

    room.id = this.rooms.length;
    this.rooms.push( room );

    // Update all tiles in the roomGrid to indicate that this room is sitting
    // on them.
    for ( let r = room.top; r <= room.bottom; r++ ) {
      for ( let c = room.left; c <= room.right; c++ ) {
        this.roomGrid[ r ][ c ].push( room );
      }
    }
    return true;
  }

  /**
   * Removes a room from the current dungeon
   * @private
   * @param {Room} room The room to remove
   */
  removeRoom( room ) {
    this.rooms = this.rooms.filter( ( r ) => r !== room );
    for ( let r = room.top; r <= room.bottom; r++ ) {
      for ( let c = room.left; c <= room.right; c++ ) {
        this.roomGrid[ r ][ c ] =
          this.roomGrid[ r ][ c ].filter( ( r ) => r !== room );
      }
    }
  }

  /**
   * Adds a door between rooms in a dungeon
   * @private
   * @param {TilePosition} position The position of the door
   */
  addDoor( position ) {
    // Get all the rooms at the location of the door
    const rooms = this.roomGrid[ position.y ][ position.x ];
    for ( const room of rooms ) {
      // convert the door position from world space to room space
      const x = position.x - room.x;
      const y = position.y - room.y;

      // set the tile to be a door
      room.tiles[ y ][ x ] = Tiles.DOOR;
    }
  }

  /**
   * Adds a hallway between two doors in the dungeon
   * @private
   * @param {TilePosition} door1 The first door
   * @param {TilePosition} door2 The second door
   * @param {number} dist The distance between the two doors
   * @return {boolean} True if the hallway could be added (or no hallway)
   */
  addHallway( door1, door2, dist ) {
    if ( dist < MIN_HALL_LENGTH ) {
      return false;
    }

    // No hallway if doors are next to each other
    if ( dist === 0 ) {
      return true;
    }
    return this.addRoom( Hallway.fromDoors( door1, door2 ) );
  }

  /**
   * Finds a room that the given room can be placed next to
   * @private
   * @param {Room} room The room to place
   * @return {RoomAttachment} The position for the new room and target room
   */
  findRoomAttachment( room ) {
    // Pick a random room (filter out the hallways)
    const r = this.r.randPick(
      this.rooms.filter( ( room ) => !( room instanceof Hallway ) )
    );

    let x = 0;
    let y = 0;
    const pad = 2 * this.doorPadding;

    // The distance between the rooms
    const dist = this.r.randInt( MIN_HALL_LENGTH, MAX_HALL_LENGTH );
    const direction = this.r.randDirection();

    // Randomly position this room on one of the sides of the random room
    switch ( direction ) {
      case Direction.NORTH:
        x = this.r.randInt( r.left - ( room.width - 1 ) + pad, r.right - pad );
        y = r.top - room.height - dist;
        break;
      case Direction.WEST:
        x = r.left - room.width - dist;
        y = this.r.randInt( r.top - ( room.height - 1 ) + pad, r.bottom - pad );
        break;
      