import Hallway from './Hallway';
import { Orientation } from '../globals';

/**
 * This class manages how the dungeon is displayed to the user based on the
 * player's current room.
 */
export default class TilemapVisibility {
  /**
   * @constructor
   * @param {Phaser.Scene} scene The main scene running the game
   * @param {Phaser.Tilemaps.DynamicTilemapLayer} shadowLayer The layer to show
   *          or hide the dungeon
   */
  constructor( scene, shadowLayer ) {
    /**
     * The main scene running the game
     * @type {Phaser.Scene}
     */
    this.scene = scene;
    
    /**
     * The layer to show / hide the dungeon
     * @type {Phaser.Tilemaps.DynamicTilemapLayer}
     */
    this.shadowLayer = shadowLayer;
    
    /**
     * The current active room where the player is located
     * @type {Room}
     */
    this.activeRoom = null;
    
    /**
     * The current active hallway where the player is located
     * @type {Hallway}
     */
    this.activeHall = null;
  }

  /**
   * Sets the current active room where the player is located. The room can also
   * be a hallway.
   * @param {Room} room The current room the player is in
   * @return {boolean}
   */
  setActiveRoom( room ) {
    if ( room instanceof Hallway ) {
      this.turnOnLights( room );
      if ( this.activeHall && this.activeHall !== room ) {
        this.dimLights( this.activeHall );
      }
      this.activeHall = room;
      return false;
    }
    else if ( room !== this.activeRoom ) {
      this.turnOnLights( room );
      if ( this.activeRoom ) {
        this.dimLights( this.activeRoom );
      }
      this.activeRoom = room;
      return true;
    }
    return false;
  }

  /**
   * Removes the shadow layer above the given room
   * @param {Room} room The room to make visible
   */
  removeShadow( room ) {
    let { x, y, width, height } = room;

    if ( room instanceof Hallway ) {
      if ( room.orientation === Orientation.HORIZONTAL ) {
        x -= 1;
        width += 2;
      }
      else if ( room.orientation === Orientation.VERTICAL ) {
        y -= 1;
        height += 2;
      }
    }
    this.shadowLayer.forEachTile(
      ( t ) => {
        t.setAlpha( 0 );
      },
      this, x, y, width, height
    );
  }

  /**
   * Turns on the lights in the given room. If no lights exist, one is created
   * @param {Room} room The room to lighten
   */
  turnOnLights( room ) {
    this.removeShadow( room );

    if ( !room.light ) {
      const scale = this.scene.map.tileWidth * this.scene.cameras.main.zoom;

      const rCX = this.scene.map.tileToWorldX( room.width % 2 === 0
        ? room.centerX
        : room.centerX + 0.5 );
      const rCY = this.scene.map.tileToWorldY( room.height % 2 === 0
        ? room.centerY
        : room.centerY + 0.5 );

      const radius = Math.max( Math.max(
        room.width * scale / 3 * 2,
        room.height * scale / 3 * 2
      ), 100 );
      const rhW = ( room.width ) * scale / 2;
      const rhH = ( room.height - 1 ) * scale / 2;

      room.light = this.scene.lights
        .addLight( rCX, rCY, radius, 0xEDC393, 0 );
      room.light.hWidth = rhW;
      room.light.hHeight = rhH;
    }
    this.scene.tweens.add( {
      targets: room.light,
      intensity: 0.8,
      duration: 200,
      ease: 'linear'
    } );
  }

  /**
   * Dims the lights in the given room. Once the light is dimmed, it is removed
   * from the game to ease up graphics.
   * @param {Room} room The room to dim
   */
  dimLights( room ) {
    if ( room.light ) {
      this.scene.tweens.add( {
        targets: room.light,
        intensity: 0,
        duration: 200,
        ease: 'linear'
      } );
      setTimeout( () => {
        this.scene.lights.removeLight( room.light ); // better performance
        room.light = null;
      }, 200 );
    }
  }
}