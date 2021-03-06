import Entity from './Entity';
import HealthBar from '../battle/HealthBar';
import BattleDrop from '../battle/BattleDrop';

/**
 * Generic enemy class for all enemies to extend
 */
export default class Enemy extends Entity {
  /**
   * @constructor
   * @param {SpriteConfig} config The configuration object for the enemy
   */
  constructor( config ) {
    super( config );

    /**
     * List of mini games (the scene key) associated with the entity.
     * @type {Array.<string>}
     */
    this.miniGames = [];
    
    /**
     * The health bar to display above the enemy
     * @type {HealthBar}
     */
    this.healthBar = new HealthBar( config.scene, {
      x: config.x - 25,
      y: config.y - this.height / 2 - 10,
      width: 50,
      height: 5
    } );
    
    /**
     * Whether or not the enemy is selected
     * @type {boolean}
     */
    this.selected = false;
    
    /**
     * The outline to display around the enemy when the enemy is selected
     * @type {Phaser.GameObjects.Rectangle}
     */
    this.outline = null;
    
    /**
     * Whether or not the enemy is active to be updated
     * @type {boolean}
     */
    this.active = true;

    this.setInteractive( { useHandCursor: true } );
  }

  /**
   * Selects the enemy
   */
  select() {
    if ( this.selected ) {
      return;
    }

    this.outline = this.scene.add
      .rectangle( this.x, this.y, this.width, this.height );
    this.outline.setStrokeStyle( 1, 0xFFFF00, 0.75 );
    this.outline.setOrigin( 0.5, 0.5 );
    this.outline.update();
    this.selected = true;
  }

  /**
   * Deselect the enemy
   */
  deselect() {
    if ( !this.selected ) {
      return;
    }
    this.outline.destroy();
    this.selected = false;
  }

  /**
   * @override
   */
  injure( amount ) {
    super.injure( amount );
    this.healthBar.setPercent( this.health / this.maxHealth );
  }

  /**
   * Attacks the given entity and injures them by the given amount
   * @param {Entity} entity The entity to attack
   * @param {number} amount How much damage to do to the entity
   */
  attack( entity, amount ) {
    entity.injure( amount );
  }

  /**
   * @override
   */
  slay() {
    this.active = false;

    // Wait for health bar to finish
    setTimeout( () => {
      BattleDrop.drop( this.x, this.y, this.scene );
      if ( this.healthBar ) {
        this.healthBar.destroy();
      }
      if ( this.outline ) {
        this.outline.destroy();
      }
      this.scene.enemyGroup.remove( this );
      super.slay();
    }, this.healthBar.config.animationDuration );
  }

  /**
   * Gets the key of a mini game from the list of mini games associated with the
   * enemy
   * @return {string|null} A mini game scene key
   */
  getRandomMiniGame() {
    if ( this.miniGames.length === 0 ) {
      return null;
    }
    return this.miniGames[
      Math.floor( Math.random() * this.miniGames.length )
    ];
  }
}