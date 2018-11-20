import Item from './Item';

/**
 * This is a health booster that can only be used when the player has health
 * below their maximum health. If the player's health is already full, the
 * player is injured (what a twisted society we live in)
 */
export default class Injection extends Item {
  /**
   * @param {number} x The x-position of the item
   * @param {number} y The y-position of the item
   * @param {Phaser.Scene} scene The current scene
   */
  constructor( x, y, scene ) {
    super( {x: x, y: y, scene: scene, key: 'injection'} );
    this.amount = 5;
    this.scene.physics.add.existing( this );
    this.collider = this.scene.physics
      .add.collider( this, this.scene.player, this.onCollide );
    this.setPipeline( 'LightPipeline' );
  }

  /**
   * Called when the player collides with the injection.
   * @param  {Injection} item The injection item
   * @param  {Player} player The player class
   */
  onCollide( item, player ) {
    if ( player.health === player.maxHealth ) {
      player.injure( item.amount );
      item.scene.cameras.main.shake( 200, 0.0025 );
      item.scene.cameras.main.flash( 200, 150, 0, 0 );
    }
    else {
      player.heal( item.amount );
    }
    item.collider.destroy();
    item.destroy();
  }
}