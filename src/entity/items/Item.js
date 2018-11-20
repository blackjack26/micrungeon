import { Entity } from '../';

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
  }
}