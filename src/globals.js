/**
 * @typedef {Object} SpriteConfig
 * @property {Phaser.Scene} scene The current scene
 * @property {number} x The horizontal position
 * @property {number} y The vertical position
 * @property {string} key The key of the texture used to render the sprite
 */

/**
 * @typedef {Object} ItemUseConfig
 * @property {Phaser.Scene} scene The current scene
 * @property {Battle} battle The current battle
 * @property {MiniGame} minigame The current minigame
 */

/**
 * @typedef {Object} HealthBarConfig
 * @property {number} width The width in pixels
 * @property {number} height The height in pixels
 * @property {number} x The horizontal position in the world
 * @property {number} y The vertical position in the world
 * @property {number} backgroundColor The background color of the bar
 * @property {number} barColor The color of the health bar
 * @property {{color: number, width: number}} border The configuration for the 
 *           border
 * @property {number} animationDuration Time in ms for the bar to change width
 */

/**
 * @typedef {Object} DungeonConfig
 * @property {number} width The width in tiles
 * @property {number} height The height in tiles
 * @property {number} randomSeed A seed for RNG
 * @property {number} doorPadding The number of tiles required on each side of a
 *           door
 * @property {RoomConfig} rooms The configuration for generating rooms
 */

/**
 * @typedef {Object} RoomConfig
 * @property {RandomNumberRange} width The width in tiles
 * @property {RandomNumberRange} height The height in tiles
 * @property {number} maxArea The maximum possible area
 * @property {number} maxRooms The maximum number of rooms allowed for
 *           generation
 */

/**
 * @typedef {Object} RandomNumberRange
 * @property {number} min The minimum possible number
 * @property {number} max The maximum possible number
 * @property {boolean} even True means only even numbers. False means only odd
 *           numbers. Undefined means all numbers.
 */

/**
 * @typedef {Object} RoomAttachment
 * @property {number} x The horizontal tile position
 * @property {number} y The vertical tile position
 * @property {Room} target The room to attach
 * @property {number} dist The distance between the two rooms
 * @property {Direction} direction The direction to the room attachment
 */

/**
 * @typedef {Object} TilePosition
 * @property {number} x The horizontal tile position
 * @property {number} y The vertical tile position
 */

/**
 * @typedef {Object} Door
 * @property {number} x The horizontal tile position
 * @property {number} y The vertical tile position
 * @property {Edge} edge The edge of the room the door lies on 
 */

/**
 * An enum describing a direction (NORTH, EAST, SOUTH, WEST)
 */
const Direction = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3
};

/**
 * An enum describing orientation (VERTICAL, HORIZONTAL)
 */
const Orientation = {
  VERTICAL: 0,
  HORIZONTAL: 1
};

/**
 * An enum describing an edge (NONE, TOP, RIGHT, BOTTOM, LEFT)
 */
const Edge = {
  NONE: -1,
  TOP: 0,
  RIGHT: 1,
  BOTTOM: 2,
  LEFT: 3
};

/**
 * An enum describing a room type (START, BATTLE, ITEM, HALLWAY, END)
 */
const RoomType = {
  START: 0,
  BATTLE: 1,
  ITEM: 2,
  HALLWAY: 3,
  END: 4
};

/**
 * An enum describing minigame difficulty (EAST, INTERMEDIATE, ADVANCED)
 */
const Difficulty = {
  EASY: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3
};

export { Direction, Orientation, RoomType, Edge, Difficulty };