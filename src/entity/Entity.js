const INVINCIBLE = -1;

/**
 * Generic entity class for anything that can be interacted with
 * in the game.
 */
class Entity extends Phaser.GameObjects.Sprite {
  /**
   * @param {object} config The configuration object for the entity
   */
  constructor( config ) {
    const { scene, x, y, key } = config;
    super( scene, x, y, key );
    this.scene = scene;
    scene.add.existing( this );

    /**
     * The maximum amount the health of the entity can be set to.
     * @type {number}
     */
    this.maxHealth = INVINCIBLE;

    /**
     * The current amount of health the entity has
     * @type {number}
     */
    this.health = INVINCIBLE;

    /**
     * Whether or not the entity is alive
     * @type {Boolean}
     */
    this.alive = true;
  }

  /**
   * Sets the current health and max health of the entity
   * @param {number} amount The amount of health the entity has
   */
  setHealth( amount ) {
    this.maxHealth = amount;
    this.health = amount;
  }

  /**
   * Heals the current entity by the given amount
   * @param  {number} amount The amount the heal the entity by
   */
  heal( amount ) {
    if ( !this.canHarm() || isNaN( amount ) ) {
      return;
    }

    // take either the max health, or the added amount
    this.health = Math.min( this.health + amount, this.maxHealth );

    // Text Display
    const healTxt = this.scene.add.text( this.x - this.width / 2,
      this.y - this.height, `+${amount}`, {
        fontSize: '16px',
        fontFamily: 'Rye',
        color: '#1ace32',
        fontWeight: 'bold'
      } );
    healTxt.setShadow( 0, 2, '#333', 10 );
    healTxt.setScale( 1 / this.scene.cameras.main.zoom );
    this.scene.tweens.add( {
      targets: healTxt,
      duration: 1000,
      alpha: 0,
      y: this.y - this.height - 20,
      ease: 'Linear'
    } );
    setTimeout( () => healTxt.destroy(), 1000 );
  }

  /**
   * Injures the current entity by the given amount
   * @param  {number} amount The amount to injure the entity by
   */
  injure( amount ) {
    if ( !this.canHarm() || isNaN( amount ) ) {
      return;
    }

    // Text Display
    const hurtTxt = this.scene.add.text( this.x - this.width / 2,
      this.y - this.height,
      `-${amount}`, {
        fontSize: '16px',
        fontFamily: 'Rye',
        color: '#e00202',
        fontWeight: 'bold'
      } );
    hurtTxt.setShadow( 0, 2, '#333', 10 );
    hurtTxt.setScale( 1 / this.scene.cameras.main.zoom );
    this.scene.tweens.add( {
      targets: hurtTxt,
      duration: 1000,
      alpha: 0,
      y: this.y - this.height - 20,
      ease: 'Linear'
    } );
    setTimeout( () => hurtTxt.destroy(), 1000 );

    // take either the min health (0), or the subtracted amount
    this.health = Math.max( this.health - amount, 0 );
    if ( this.health === 0 ) {
      this.slay();
    }
  }

  /**
   * If the entity is invincible, then the entity cannot be harmed.
   * @return {boolean} True if the entity can be harmed
   */
  canHarm() {
    return this.maxHealth !== INVINCIBLE;
  }

  /**
   * Called when the player wants to interact with the current entity.
   */
  interactWith() {
    // Does nothing (entity doesn't interact with player)
  }

  /**
   * A nicer way to kill off an entity to remove it from the scene.
   */
  slay() {
    this.alive = false;
    this.destroy();
  }
}

module.exports = {
  Entity: Entity,
  INVINCIBLE: INVINCIBLE
};