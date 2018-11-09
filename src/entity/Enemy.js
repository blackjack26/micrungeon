import { Entity } from './';

/**
 * Generic enemy class for all enemies to extend
 */
export default class Enemy extends Entity {
  /**
   * @param {object} config The configuration object for the enemy
   */
  constructor( config ) {
    super( config );

    /**
     * List of mini games (the scene key) associated with the entity.
     * @type {Array}
     */
    this.miniGames = [];
  }

  /**
   * Attacks the given entity and injures them by the given amount
   * @param  {Entity} entity The entity to attack
   * @param  {number} amount How much damage to do to the entity
   */
  attack( entity, amount ) {
    entity.injure( amount );
  }

  /**
   * @override
   */
  slay() {
    this.scene.enemyGroup.remove( this );
    super.slay();
  }

  /**
   * Gets the key of a mini game from the list of mini games associated
   * with the enemy
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