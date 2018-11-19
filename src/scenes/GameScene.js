import {
  DanceDance,
  Difficulty
} from '../minigames';
import KeyBinding from '../util/KeyBinding';
import Dungeon from '../dungeon/Dungeon';
import Hallway from '../dungeon/Hallway';
import { Orientation, RoomType, Edge } from '../globals';
import TILES from '../dungeon/TileMappings';
import TilemapVisibility from '../dungeon/TilemapVisibility';
import LightPipeline from '../util/LightPipeline';
import { Player } from '../entity';

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
    // Load all mini games here, possibly move to BootScene
    this.scene.add( 'DanceDance', DanceDance );

    this.game.renderer.addPipeline( 'LightPipeline', new LightPipeline( {
      game: this.game,
      renderer: this.game.renderer,
      maxLights: 10
    } ) );
  }

  /**
   * @override
   */
  create() {
    this.keys = KeyBinding.createKeys( this,
      [ 'up', 'left', 'right', 'down' ] );
    this.createDungeonMap();
    this.createPlayer();
    this.formatCamera();
  }

  /**
   * @override
   */
  update( time, delta ) {
    // NOTE: Example code, remove later
    // if ( this.keys.up.isDown && this.keys.up.repeats === 1 ) {
    //   this.playMinigame( 'DanceDance' );
    // }
    // else if ( this.keys.left.isDown && this.keys.left.repeats === 1 ) {
    //   this.playMinigame( 'DanceDance', Difficulty.INTERMEDIATE );
    // }
    // else if ( this.keys.right.isDown && this.keys.right.repeats === 1 ) {
    //   this.playMinigame( 'DanceDance', Difficulty.ADVANCED );
    // }

    this.player.update( time, delta );
    this.updateMapVisibility();
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
            playerRoom
          );
        }
        else if ( Edge.BOTTOM === edge ) {
          this.player.setDestination(
            this.player.x,
            this.player.y - this.map.tileHeight * 2,
            playerRoom
          );
        }
        else if ( Edge.LEFT === edge ) {
          this.player.setDestination(
            this.player.x + this.map.tileWidth * 2,
            this.player.y,
            playerRoom
          );
        }
        // Right
        else if ( Edge.RIGHT === edge ) {
          this.player.setDestination(
            this.player.x - this.map.tileWidth * 2,
            this.player.y,
            playerRoom
          );
        }
      }
    }
    playerRoom.entered = true;
  }

  /**
   * Adds the doors to the room to lock the player in for battle
   * @param {Room} room The room to lock
   */
  lockRoom( room ) {
    const duration = 750;
    const { x, y, doors, centerX, centerY } = room;

    this.player.movementDisabled = true;

    const camera = this.cameras.main;
    camera.stopFollow();
    camera.pan(
      this.map.tileToWorldX( centerX + 0.5 ),
      this.map.tileToWorldY( centerY + 0.5 ),
      duration, 'Linear'
    );

    setTimeout( () => {
      camera.shake( 200, 0.0025 );
      doors.forEach( ( door ) => {
        // Top or Bottom
        if ( door.edge === Edge.TOP || door.edge === Edge.BOTTOM ) {
          this.stuffLayer.putTilesAt( TILES.GATE.HORIZONTAL, x + door.x - 1,
            y + door.y );
        }
        // Left or Right
        else if ( door.edge === Edge.LEFT || door.edge === Edge.RIGHT ) {
          this.stuffLayer.putTilesAt( TILES.GATE.VERTICAL, x + door.x,
            y + door.y - 1 );
        }
      } );
      this.stuffCollider.update();
      this.player.movementDisabled = false;
    }, duration );
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
    this.player = new Player( {
      scene: this,
      key: 'sample-sprites',
      x: sX,
      y: sY
    } );
    this.physics.add.existing( this.player );

    this.physics.add.collider( this.player, this.groundLayer );
    this.stuffCollider =
      this.physics.add.collider( this.player, this.stuffLayer );
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
   * Opens the given mini game and pauses the game until mini game is over
   * @param {string} name The name of the mini game
   * @param {number} difficulty The difficulty of the mini game
   */
  playMinigame( name, difficulty = Difficulty.EASY ) {
    this.currentMinigame = this.scene.get( name );
    if ( !this.currentMinigame ) {
      return;
    }

    this.scene.launch( name, {
      parent: this,
      difficulty: difficulty
    } );
    this.scene.bringToTop( name );
    this.scene.pause();
    console.log( 'Play MiniGame' );
  }

  /**
   * Stops the current mini game and resumes the game
   * @param {object} result The result of the mini game
   */
  continueCombat( result ) {
    console.log( 'MiniGame Results:', result );
    this.scene.stop( this.currentMinigame.key );
    this.input.keyboard.resetKeys();
    this.scene.resume();
    console.log( 'Resume Combat' );
  }
}