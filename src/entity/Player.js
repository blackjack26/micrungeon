import { Entity } from './';
import HealthBar from '../battle/HealthBar';
import { Inventory } from './items';

/**
 * Base class for all player interactions
 */
export default class Player extends Entity {
  /**
   * @override
   */
  constructor( x, y, scene ) {
    super( {
      scene: scene,
      key: 'player',
      x: x,
      y: y
    } );
    this.inventory = new Inventory();
    this.speed = 200;
    this.movementDisabled = false;
    // this.anims.play( 'sample' );
    this.setHealth( 10 );
    this.drawPlayerHUD();
    this.setPipeline( 'LightPipeline' );
  }

  /**
   * Draws the player HUD
   */
  drawPlayerHUD() {
    const { width } = this.scene.game.config;
    const HUD_X = -width;

    const healthTxt = this.scene.add.text(
      HUD_X + 10, 10, 'Health', {
        fontSize: '12px',
        color: '#FFF',
        fontFamily: 'Rye'
      }
    );

    this.healthBar = new HealthBar( this.scene, {
      x: healthTxt.x + healthTxt.width + 10,
      y: 12,
      height: 10
    } );
  }

  /**
   * @override
   */
  update( time, delta ) {
    // Stop any previous movement from the last frame
    this.body.setVelocity( 0 );

    // Allow player to move themselves
    if ( !this.movementDisabled ) {
      // Horizontal movement
      if ( this.scene.keys.left.isDown ) {
        this.body.setVelocityX( -this.speed );
      }
      else if ( this.scene.keys.right.isDown ) {
        this.body.setVelocityX( this.speed );
      }

      // Vertical movement
      if ( this.scene.keys.up.isDown ) {
        this.body.setVelocityY( -this.speed );
      }
      else if ( this.scene.keys.down.isDown ) {
        this.body.setVelocityY( this.speed );
      }
    }
    // Automatically move player into a battle room and lock doors
    else if ( this.dest ) {
      this.body.setVelocityX( this.dest.x - this.x );
      this.body.setVelocityY( this.dest.y - this.y );
      if ( this.body.velocity.length() < 2 ) {
        this.movementDisabled = false;
        if ( typeof this.movementCallback === 'function' ) {
          this.movementCallback();
          this.movementCallback = null;
        }
        this.dest = null;
      }
    }

    // Normalize and scale the velocity so that sprite can't move
    // faster along a diagonal
    this.body.velocity.normalize().scale( this.speed );
  }

  /**
   * @override
   */
  injure( damage ) {
    super.injure( damage );
    this.healthBar.setPercent( this.health / this.maxHealth );
  }

  /**
   * @override
   */
  heal( amount ) {
    super.heal( amount );
    this.healthBar.setPercent( this.health / this.maxHealth );
  }

  /**
   * @override
   */
  slay() {
    this.alive = false;
  }

  /**
   * Sets the destination for the player to move to
   * @param {number} x The x-coordinate
   * @param {number} y The y-coordinate
   * @param {*} callback The callback when the movement is finished
   */
  setDestination( x, y, callback ) {
    this.dest = {
      x: x,
      y: y
    };
    this.movementDisabled = true;
    this.movementCallback = callback;
  }
}