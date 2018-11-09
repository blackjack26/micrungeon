import { Entity } from './';

/**
 * Sample entity for animation purposes. DELETE THIS SAMPLE
 */
export default class SampleEntity extends Entity {
  /**
   * [constructor description]
   * @param {[type]} config [description]
   */
  constructor( config ) {
    super( config );
    this.anims.play( 'sample' );
  }
}