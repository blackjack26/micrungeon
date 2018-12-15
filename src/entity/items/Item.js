import { Entity } from '../';
import { ItemType } from './';

/**
 * This is the base class for all items
 */
export default class Item extends Entity {
  /**
   * @param {object} config The configuration object for the entity
   */
  constructor( config ) {
    super( config );
    this.scene = config.scene;
    this.itemType = ItemType.ANY;

    // Collision
    this.scene.physics.add.existing( this );
    this.body.setImmovable( true );
    this.playerCollider = this.scene.physics
      .add.collider( this, this.scene.player, this.onCollide );

    // Interactive
    this.setInteractive( { useHandCursor: true } );
    this.on( 'pointerover', () => {
      this.select();
    } );
    this.on( 'pointerout', () => {
      this.unselect();
    } );

    // Lighting
    this.setPipeline( 'LightPipeline' );
  }

  /**
   * Called when the item is selected
   */
  select() {
    this.setScale( this.scaleX + 0.2 );

    this.helpText = this.scene.add.text( this.x, this.y, this.name, {
      fontSize: '14px',
      fontFamily: 'Rye',
      color: '#FFFFFF'
    } );
    this.helpText.setShadow( 0, 2, '#333', 10 );
    this.helpText.setScale( 1 / this.scene.cameras.main.zoom );
  }

  /**
   * Called when the item is unselected
   */
  unselect() {
    this.setScale( this.scaleX - 0.2 );
    this.helpText.destroy();
  }

  /**
   * Called when the player collides with the injection.
   * @param  {Injection} item The injection item
   * @param  {Player} player The player class
   */
  onCollide( item, player ) {
    if ( player.inventory.addItem( item ) ) {
      item.playerCollider.destroy();
      item.destroy();
      if ( item.helpText ) {
        item.helpText.destroy();
      }
    }
  }
}