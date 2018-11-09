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
   * Heals the current entity by the given amount
   * @param  {number} amount The amount the heal the entity by
   */
  heal( amount ) {
    if ( !this.canHarm() || isNaN( amount ) ) {
      return;
    }

    // take either the max health, or the added amount
    this.health = Math.min( this.health + amount, this.maxHealth );
  }

  /**
   * Injures the current entity by the given amount
   * @param  {number} amount The amount to injure the entity by
   */
  injure( amount ) {
    if ( !this.canHarm() || isNaN( amount ) ) {
      return;
    }

    // take either the min health (0), or the subtracted amount
    this.health = Math.max( this.health - amount, 0 );
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