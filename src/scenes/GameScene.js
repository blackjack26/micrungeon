import KeyBinding from '../util/KeyBinding';
import Dungeon from '../dungeon/Dungeon';
import Hallway from '../dungeon/Hallway';
import { Orientation, RoomType, Edge } from '../globals';
import TILES from '../dungeon/TileMappings';
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
    this.inCombat = false;
    this.keys = KeyBinding.createKeys( this,
      [ 'up', 'left', 'right', 'down', 'space', 'interact', 'pause' ] );
    this.createDungeonMap();
    this.createPlayer();
    this.formatCamera();
    this.enemyGroup = this.add.group();
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
      .launch( 'PauseScene', {parent: this} )
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
      item.use( { player: this.player } );
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
      if ( !playerRoom.entered && playerRoom.type === RoomType.BATTLE ) {
        const edge = playerRoom.getEdge( playerTileX, playerTileY );
        if ( Edge.TOP === edge ) {
          this.player.setDestination(
            this.player.x,
            this.player.y + this.map.tileHeight * 2,
            () => { this.beginCombat( playerRoom, Edge.TOP ); }
          );
        }
        else if ( Edge.BOTTOM === edge ) {
          this.player.setDestination(
            this.player.x,
            this.player.y - this.map.tileHeight * 2,
            () => { this.beginCombat( playerRoom, Edge.BOTTOM ); }
          );
        }
        else if ( Edge.LEFT === edge ) {
          this.player.setDestination(
            this.player.x + this.map.tileWidth * 2,
            this.player.y,
            () => { this.beginCombat( playerRoom, Edge.LEFT ); }
          );
        }
        // Right
        else if ( Edge.RIGHT === edge ) {
          this.player.setDestination(
            this.player.x - this.map.tileWidth * 2,
            this.player.y,
            () => { this.beginCombat( playerRoom, Edge.RIGHT ); }
          );
        }
      }
      else if ( !playerRoom.entered && playerRoom.type === RoomType.ITEM ) {
        playerRoom.spawnItem( this );
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
      map.createBlankDynamicLayer( 'Ground', tileset ).fill( TILES.BLANK );
    this.stuffLayer = map.createBlankDynamicLayer( 'Stuff', tileset );
    const shadowLayer = map.createBlankDynamicLayer( 'Shadow', tileset )
      .fill( TILES.BLANK );

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
   * @param  {Hallway} hallway the hallway being added
   */
  createHallway( hallway ) {
    const { width, height, left, right, top, bottom } = hallway;
    if ( hallway.orientation === Orientation.HORIZONTAL ) {
      this.groundLayer.fill( TILES.WALL.TOP, left, top, width, 1 );
      this.groundLayer.fill( TILES.FLOOR, left, top + 1, width, 1 );
      this.groundLayer.fill( TILES.WALL.BOTTOM, left, bottom, width, 1 );
    }
    else if ( hallway.orientation === Orientation.VERTICAL ) {
      this.groundLayer.fill( TILES.WALL.LEFT, left, top, 1, height );
      this.groundLayer.fill( TILES.FLOOR, left + 1, top, 1, height );
      this.groundLayer.fill( TILES.WALL.RIGHT, right, top, 1, height );
    }
  }

  /**
   * Creates a room on the ground layer
   * @param  {Room} room the room being added
   */
  createRoom( room ) {
    const { x, y, width, height, left, right, top, bottom } = room;

    // Fill the floor
    this.groundLayer.fill( TILES.FLOOR, x + 1, y + 1, width - 2, height - 2 );

    // Place the room corners tiles
    this.groundLayer.putTileAt( TILES.WALL.TOP_LEFT, left, top );
    this.groundLayer.putTileAt( TILES.WALL.TOP_RIGHT, right, top );
    this.groundLayer.putTileAt( TILES.WALL.BOTTOM_LEFT, left, bottom );
    this.groundLayer.putTileAt( TILES.WALL.BOTTOM_RIGHT, right, bottom );

    // Fill the walls
    this.groundLayer.fill( TILES.WALL.TOP, left + 1, top, width - 2, 1 );
    this.groundLayer.fill( TILES.WALL.BOTTOM, left + 1,
      bottom, width - 2, 1 );
    this.groundLayer.fill( TILES.WALL.LEFT, left, top + 1, 1, height - 2 );
    this.groundLayer.fill( TILES.WALL.RIGHT, right, top + 1,
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
      this.groundLayer.putTileAt( TILES.FLOOR,
        x + door.x, y + door.y );

      // TOP
      if ( Edge.TOP === door.edge ) {
        if ( door.x === 1 ) {
          this.groundLayer.putTilesAt( TILES.DOOR.TOP.LEFT, x, y );
          tl = true;
        }
        else if ( door.x === room.width - 2 ) {
          this.groundLayer.putTilesAt( TILES.DOOR.TOP.RIGHT,
            x + door.x - 1, y );
          tr = true;
        }
        else {
          this.groundLayer.putTilesAt( TILES.DOOR.TOP.MIDDLE,
            x + door.x - 1, y );
        }
      }
      // BOTTOM
      else if ( Edge.BOTTOM === door.edge ) {
        if ( door.x === 1 ) {
          this.groundLayer.putTilesAt( TILES.DOOR.BOTTOM.LEFT,
            x, y + height - 1 );
          bl = true;
        }
        else if ( door.x === room.width - 2 ) {
          this.groundLayer.putTilesAt( TILES.DOOR.BOTTOM.RIGHT,
            x + door.x - 1, y + height - 1 );
          br = true;
        }
        else {
          this.groundLayer.putTilesAt( TILES.DOOR.BOTTOM.MIDDLE,
            x + door.x - 1, y + height - 1 );
        }
      }
      // LEFT
      else if ( Edge.LEFT === door.edge ) {
        if ( door.y === 1 ) {
          this.groundLayer.putTilesAt( TILES.DOOR.LEFT.TOP, x, y );
          lt = true;
        }
        else if ( door.y === room.height - 2 ) {
          this.groundLayer.putTilesAt( TILES.DOOR.LEFT.BOTTOM,
            x, y + door.y - 1 );
          lb = true;
        }
        else {
          this.groundLayer.putTilesAt( TILES.DOOR.LEFT.MIDDLE,
            x, y + door.y - 1 );
        }
      }
      // RIGHT
      else if ( Edge.RIGHT === door.edge ) {
        if ( door.y === 1 ) {
          this.groundLayer.putTilesAt( TILES.DOOR.RIGHT.TOP,
            x + width - 1, y );
          rt = true;
        }
        else if ( door.y === room.height - 2 ) {
          this.groundLayer.putTilesAt( TILES.DOOR.RIGHT.BOTTOM,
            x + width - 1, y + door.y - 1 );
          rb = true;
        }
        else {
          this.groundLayer.putTilesAt( TILES.DOOR.RIGHT.MIDDLE,
            x + width - 1, y + door.y - 1 );
        }
      }
    } );

    // Check for doors at corners
    if ( tl && lt ) { // Top-Left and Left-Top
      this.groundLayer.putTileAt( TILES.CORNER.BOTTOM_RIGHT, x, y );
    }
    if ( tr && rt ) { // Top-Right and Right-Top
      this.groundLayer.putTileAt( TILES.CORNER.BOTTOM_LEFT,
        x + width - 1, y );
    }
    if ( bl && lb ) { // Bottom-Left and Left-Bottom
      this.groundLayer.putTileAt( TILES.CORNER.TOP_RIGHT,
        x, y + height - 1 );
    }
    if ( br && rb ) { // Bottom-Right and Right-Bottom
      this.groundLayer.putTileAt( TILES.CORNER.TOP_LEFT,
        x + width - 1, y + height - 1 );
    }
  }

  /**
   * Adds a player to the room. Also adds colliders to existing layers.
   */
  createPlayer() {
    const sX = this.map.tileToWorldX( this.dungeon.startRoom.centerX );
    const sY = this.map.tileToWorldY( this.dungeon.startRoom.centerY );
    this.player = new Player( sX, sY, this );
    this.physics.add.existing( this.player );

    this.physics.add.collider( this.player, this.groundLayer );
    this.stuffCollider =
      this.physics.add.collider( this.player, this.stuffLayer );

    BattleDrop.drop( sX - 25, sY - 25, this );
  }

  /**
   * Formats the camera to the generated dungeon, starts following the
   * player object, and sets the render pipelines for layers affected by light
   */
  formatCamera() {
    const camera = this.cameras.main;
    camera.setBounds( 0, 0, this.mapWidthInPixels, this.mapHeightInPixels );
    camera.startFollow( this.player );
    camera.setZoom( 1.5 );

    this.lights.enable().setAmbientColor( 0x111111 );
    this.groundLayer.setPipeline( 'LightPipeline' );
    this.stuffLayer.setPipeline( 'LightPipeline' );
  }

  /**
   * Called when the player is dead
   */
  gameOver() {
    setTimeout( () => {
      this.battle = null;
      this.scene.start( 'TitleScene' );
    }, 200 );
  }
}