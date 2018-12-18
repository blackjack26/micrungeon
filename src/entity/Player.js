import Entity from './Entity';
import HealthBar from '../battle/HealthBar';
import { Inventory } from './items';
import Random from '../util/Random';

/**
 * Base class for all player interactions
 */
export default class Player extends Entity {
  /**
   * @constructor
   * @param {number} x The horizontal position
   * @param {number} y The vertical position
   * @param {Phaser.Scene} scene The current scene
   */
  constructor( x, y, scene ) {
    super( {
      scene: scene,
      key: 'player',
      x: x,
      y: y
    } );
    
    /**
     * The player's inventory to hold items
     * @type {Inventory}
     */
    this.inventory = new Inventory();
    
    /**
     * The players movement speed in the world
     * @type {number}
     */
    this.speed = 200;
    
    /**
     * If true, the player cannot move by use of the keyboard / controller
     * @type {boolean}
     */
    this.movementDisabled = false;
    
    /**
     * The chance that a critical hit will happen (0-100)
     * @type {number}
     */
    this.criticalChance = 0;
    
    /**
     * Whether or not the player is alive
     * @type {boolean}
     */
    this.alive = true;
    
    /**
     * The movement destination of the player. Used when moving the player
     * without the use of the keyboard.
     * @type {{ x: number, y: number }}
     */
    this.dest = null;
    
    /**
     * The callback when automatic player movement is finished
     * @type {function}
     */
    this.movementCallback = null;
    
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
    healthTxt.setShadow( 0, 2, '#000', 10 );

    /**
     * The player's health bar
     * @type {HealthBar}
     */
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
   * Attacks the given enemy with the given damage
   * @param {Enemy} enemy The enemy to attack
   * @param {number} damage The amount to injure the enemy
   */
  attack( enemy, damage ) {
    // Critical Hit
    if ( this.criticalChance !== 0 ) {
      const r = new Random();
      if ( r.randInt( 0, 100 ) < this.criticalChance ) {
        damage = enemy.health;
      }
    }
    enemy.injure( damage );
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
   * @param {function} callback The callback when the movement is finished
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