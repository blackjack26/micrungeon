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
     * @typ