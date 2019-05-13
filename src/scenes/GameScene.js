import KeyBinding from '../util/KeyBinding';
import Dungeon from '../dungeon/Dungeon';
import Hallway from '../dungeon/Hallway';
import { Edge, Orientation, RoomType } from '../globals';
import Tileset from '../dungeon/TileMappings';
import TilemapVisibility from '../dungeon/TilemapVisibility';
import { Player } from '../entity';
import Battle from '../battle/Battle';
import BattleDrop from '../battle/BattleDrop';
import { ItemType } from '../entity/items';

/**
 * The game scene is the main scene used when the player is in actual game play.
 * All mini game and dungeon gameplay will be from this scene.
 */
export default class GameScene extends Phaser.Scene {
  /**
   * Initializes the game scene
   * @constructor
   */
  constructor() {
    super( { key: 'GameScene' } );
  }

  /**
   * @override
   */
  preload() {
  }

  /**
   * @override
   */
  create() {
    /**
     * A collection of the timeouts currently pending based on the number of
     * rooms visited since the timeout was added
     * @type {Map.<string, {remaining: number, callback: function}>}
     */
    this.roomCooloffs = {};
    
    /**
     * A collection of the keys available for use in the game
     * @type {Object}
     */
    this.keys = KeyBinding.createKeys( this,
      [ 'up', 'left', 'right', 'down', 'space', 'interact', 'pause' ] );
    
    /**
     * The scene groups to hold all of the enemies present
     * @type {Phaser.GameObjects.Group}
     */
    this.enemyGroup = this.add.group();
    
    /**
     * The current battle in progress
     * @type {Battle}
     */
    this.battle = null;
    
    /**
     * The dungeon the player is currently in
     * @type {Dungeon}
     */
    this.dungeon = null;
    
    /**
     * The width of the map in pixels
     * @type {number}
     */
    this.mapWidthInPixels = -1;
    
    /**
     * The height of the map in pixels
     * @type {number}
     */
    this.mapHeightInPixels = -1;
    
    /**
     * The current map displayed to the user
     * @type {Phaser.Tilemaps.Tilemap}
     */
    this.map = null;
    
    /**
     * The general layer building the dungeon (walls, floors)
     * @type {Phaser.Tilemaps.DynamicTilemapLayer}
     */
    this.groundLayer = null;
    
    /**
     * The layer that contains all of the objects in the dungeon (i.e. doors)
     * @type {Phaser.Tilemaps.DynamicTilemapLayer}
     */
    this.stuffLayer = null;
    
    /**
     * Used to show / hide the dungeon
     * @type {TilemapVisibility}
     */
    this.tilemapVisibility = null;
    
    /**
     * The player in the dungeon
     * @type {Player}
     */
    this.player = null;
    
    this.createDungeonMap();
    this.createPlayer();
    this.formatCamera();
    this.configCameraHUD();
  }

  /**
   * @override
   */
  update( time, delta ) {
    this.player.update( time, delta );
    if ( this.battle && this.battle.active ) {
      this.battle.update();
    }
    else {
      this.updateMapVisibility();
    }

    if ( this.keys.interact.isDown ) {
      this.openInventory();
    }

    if ( this.keys.pause.isDown ) {
      this.pause();
    }
  }

  /**
   * Pauses the game
   */
  pause() {
    this.input.keyboard.resetKeys();
    this.scene
      .launch( 'PauseScene', { parent: this } )
      .bringToTop( 'PauseScene' )
      .pause();
  }

  /**
   * Unpauses the game
   */
  unpause() {
    this.scene.stop( 'PauseScene' );
    this.input.keyboard.resetKeys();
    this.scene.resume();
  }

  /**
   * Opens the inventory
   */
  openInventory() {
    this.input.keyboard.resetKeys();
    this.scene
      .launch( 'InventoryScene', {
        parent: this,
        inventory: this.player.inventory,
        context: ItemType.ANY
      } )
      .bringToTop( 'InventoryScene' )
      .pause();
  }

  /**
   * Closes the inventory
   * @param {Item} item The item selected from the inventory
   */
  closeInventory( item ) {
    this.scene.stop( 'InventoryScene' );
    this.input.keyboard.resetKeys();
    this.scene.resume();

    if ( item && item.itemType === ItemType.ANY ) {
      item.use( {
        player: this.player,
        scene: this,
        battle: this.battle
      } );
      this.player.inventory.items.splice( item.inventoryIndex, 1 );
    }
  }

  /**
   * Creates the HUD camera
   */
  configCameraHUD() {
    const { width, height } = this.game.config;
    const HUD_X = -width;
    const hudCamera = this.cameras.add( 0, 0, width, height, false, 'HUD' );
    hudCamera.scrollX = HUD_X;
  }

  /**
   * Updates the visibility of the map
   */
  updateMapVisibility() {
    const playerTileX = this.groundLayer.worldToTileX( this.player.x );
    const playerTileY = this.groundLayer.worldToTileY( this.player.y );
    const playerRoom = this.dungeon.getRoomAt( playerTileX, playerTileY );

    if ( this.tilemapVisibility.setActiveRoom( playerRoom ) ) {
      if ( !playerRoom.entered ) {
        // Battle Room
        if ( playerRoom.type === RoomType.BATTLE && !this.preventSpawn ) {
          const edge = playerRoom.getEdge( playerTileX, playerTileY );
          if ( Edge.TOP === edge ) {
            this.player.setDestination(
              this.player.x,
              this.player.y + this.map.tileHeight * 2,
              () => {
                this.beginCombat( playerRoom, Edge.TOP );
              }
            );
          }
          else if ( Edge.BOTTOM === edge ) {
            this.player.setDestination(
              this.player.x,
              this.player.y - this.map.tileHeight * 2,
              () => {
                this.beginCombat( playerRoom, Edge.BOTTOM );
              }
            );
          }
          else if ( Edge.LEFT === edge ) {
            this.player.setDestination(
              this.player.x + this.map.tileWidth * 2,
              this.player.y,
              () => {
                this.beginCombat( playerRoom, Edge.LEFT );
              }
            );
          }
          // Right
          else if ( Edge.RIGHT === edge ) {
            this.player.setDestination(
              this.player.x - this.map.tileWidth * 2,
              this.player.y,
              () => {
                this.beginCombat( playerRoom, Edge.RIGHT );
              }
            );
          }
        }
        // Item Room
        else if ( playerRoom.type === RoomType.ITEM ) {
          playerRoom.spawnItem( this );
        }
      }

      // Only reduce room cooloff when entering rooms
      if ( !( playerRoom instanceof Hallway ) ) {
        const shouldDelete = [];
        Object.keys( this.roomCooloffs ).forEach( ( key ) => {
          this.roomCooloffs[ key ].remaining--;
          if ( this.roomCooloffs[ key ].remaining <= 0 ) {
            this.roomCooloffs[ key ].callback();
            shouldDelete.push( key );
          }
        } );
        shouldDelete.forEach( ( key ) => {
          delete this.roomCooloffs[ key ];
        } );
      }
    }

    playerRoom.entered = true;
  }

  /**
   * Begins combat inside of a battle room
   * @param {Room} room The room to begin a battle in
   * @param {number} edge The edge the player entered on
   */
  beginCombat( room, edge ) {
    this.battle = new Battle( room, edge, this );
    this.battle.begin();
  }

  /**
   * Ends the combat inside of the battle room
   */
  endCombat() {
    this.battle.end()
      .then( () => this.battle = null );
  }

  /**
   * Creates the map of the dungeon
   */
  createDungeonMap() {
    this.dungeon = new Dungeon();

    // Initialize Dungeon Map
    const map = this.make.tilemap( {
      tileWidth: 32,
      tileHeight: 32,
      width: this.dungeon.width,
      height: this.dungeon.height
    } );
    this.mapWidthInPixels = map.widthInPixels;
    this.mapHeightInPixels = map.heightInPixels;
    this.map = map;

    // Create Tilesets & Layers
    const tileset = map.addTilesetImage( 'dungeon_tiles', null, 32, 32, 1, 2 );
    this.groundLayer =
      map.createBlankDynamicLayer( 'Ground', tileset ).fill( Tileset.BLANK );
    this.stuffLayer = map.createBlankDynamicLayer( 'Stuff', tileset );
    const shadowLayer = map.createBlankDynamicLayer( 'Shadow', tileset )
      .fill( Tileset.BLANK );

    this.tilemapVisibility = new TilemapVisibility( this, shadowLayer );

    // Create Rooms in Dungeon
    this.dungeon.rooms.forEach( ( room ) => {
      if ( room instanceof Hallway ) {
        this.createHallway( room );
      }
      else {
        this.createRoom( room );
      }
    } );

    // Collision
    this.groundLayer.setCollisionByExclusion( [ -1, 9 ] );
    this.stuffLayer.setCollision( [ 24, 25, 26, 32, 40 ] );
  }

  /**
   * Creates a hallway on the ground layer
   * @param {Hallway} hallway the hallway being added
   */
  createHallway( hallway ) {
    const { width, height, left, right, top, bottom } = hallway;
    if ( hallway.orientation === Orientation.HORIZONTAL ) {
      this.groundLayer.fill( Tileset.WALL.TOP, left, top, width, 1 );
      this.groundLayer.fill( Tileset.FLOOR, left, top + 1, width, 1 );
      this.groundLayer.fill( Tileset.WALL.BOTTOM, left, bottom, width, 1 );
    }
    else if ( hallway.orientation === Orientation.VERTICAL ) {
      this.groundLayer.fill( Tileset.WALL.LEFT, left, top, 1, height );
      this.groundLayer.fill( Tileset.FLOOR, left + 1, top, 1, height );
      this.groundLayer.fill( Tileset.WALL.RIGHT, right, top, 1, height );
    }
  }

  /**
   * Creates a room on the ground layer
   * @param {Room} room the room being added
   */
  createRoom( room ) {
    const { x, y, width, height, left, right, top, bottom } = room;

    // Fill the floor
    this.groundLayer.fill( Tileset.FLOOR, x + 1, y + 1, width - 2, height - 2 );

    // Place the room corners tiles
    this.groundLayer.putTileAt( Tileset.WALL.TOP_LEFT, left, top );
    this.groundLayer.putTileAt( Tileset.WALL.TOP_RIGHT, right, top );
    this.groundLayer.putTileAt( Tileset.WALL.BOTTOM_LEFT, left, bottom );
    this.groundLayer.putTileAt( Tileset.WALL.BOTTOM_RIGHT, right, bottom );

    // Fill the walls
    this.groundLayer.fill( Tileset.WALL.TOP, left + 1, top, width - 2, 1 );
    this.groundLayer.fill( Tileset.WALL.BOTTOM, left + 1,
      bottom, width - 2, 1 );
    this.groundLayer.fill( Tileset.WALL.LEFT, left, top + 1, 1, height - 2 );
    this.groundLayer.fill( Tileset.WALL.RIGHT, right, top + 1,
      1, height - 2 );

    // Doors
    let tl; // Top-Left
    let tr; // Top-Right
    let bl; // Bottom-Left
    let br; // Bottom-Right
    let lt; // Left-Top
    let lb; // Left-Bottom
    let rt; // Right-Top
    let rb; // Right-Bottom
    room.doors.forEach( ( door ) => {
      this.groundLayer.putTileAt( Tileset.FLOOR,
        x + door.x, y + door.y );

      // TOP
      if ( Edge.TOP === door.edge ) {
        if ( door.x === 1 ) {
          this.groundLayer.putTilesAt( Tileset.DOOR.TOP.LEFT, x, y );
       