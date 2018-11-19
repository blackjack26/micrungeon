import { Entity } from './';

/**
 * Base class for all player interactions
 */
export default class Player extends Entity {
  /**
   * @override
   */
  constructor( config ) {
    super( config );
    this.anims.play( 'sample' );
    this.speed = 200;
    this.movementDisabled = false;
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
      if ( this.body.velocity.length() < 1 ) {
        this.movementDisabled = false;
        this.scene.lockRoom( this.dest.room );
        this.dest = null;
      }
    }

    // Normalize and scale the velocity so that sprite can't move
    // faster along a diagonal
    this.body.velocity.normalize().scale( this.speed );
  }

  /**
   * Sets the destination for the player to move to
   * @param {number} x The x-coordinate
   * @param {number} y The y-coordinate
   * @param {Room} room The room the player is in
   */
  setDestination( x, y, room ) {
    this.dest = {
      x: x,
      y: y,
      room: room
    };
    this.movementDisabled = true;
  }
}