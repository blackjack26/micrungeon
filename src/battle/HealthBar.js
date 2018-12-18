/**
 * The health bar is a generic bar to display the health of an entity
 */
export default class HealthBar {
  /**
   * @constructor
   * @param {Phaser.Scene} scene The current scene
   * @param {HealthBarConfig} config The altered config
   */
  constructor( scene, config ) {
    /**
     * The current scene
     * @type {Phaser.Scene}
     */
    this.scene = scene;
    
    /**
     * The configuration for the health bar
     * @type {HealthBarConfig}
     */
    this.config = this._mergeWithDefaultConfig( config );
    
    /**
     * The horizontal position in the world
     * @type {number}
     */
    this.x = 0;
    
    /**
     * The vertical position in the world
     * @type {number}
     */
    this.y = 0;
    
    /**
     * The border graphic around the health bar
     * @private
     * @type {Phaser.GameObjects.Rectangle}
     */
    this._border = null;
    
    /**
     * The background graphic behind the health bar
     * @private
     * @type {Phaser.GameObjects.Rectangle}
     */
    this._background = null;
    
    /**
     * The bar graphic to display the health
     * @private
     * @type {Phaser.GameObjects.Rectangle}
     */
    this._bar = null;
    
    this.setPosition( this.config.x, this.config.y );
    this._drawBackground();
    this._drawBorder();
    this._drawHealthBar();
  }

  /**
   * Merges the given config with the defaults
   * @private
   * @param {HealthBarConfig} config The given config
   * @return {HealthBarConfig} the merged config object
   */
  _mergeWithDefaultConfig( config ) {
    const defaultConfig = {
      width: 250,
      height: 40,
      x: 0,
      y: 0,
      backgroundColor: 0x651828,
      barColor: 0xFF0000,
      border: {
        color: 0x000000,
        width: 1
      },
      animationDuration: 200
    };
    return Object.assign( {}, defaultConfig, config );
  }

  /**
   * Draws the border of the health bar
   * @private
   */
  _drawBorder() {
    const { x, y, width, height } = this.config;
    const bw = this.config.border.width;
    this._border = this.scene.add.rectangle( x - bw, y - bw,
      width + bw * 2, height + bw * 2 );
    this._border.setStrokeStyle( this.config.border.color );
    this._border.lineWidth = bw;
    this._border.setOrigin( 0, 0 );
  }

  /**
   * Draws the background of the health bar
   * @private
   */
  _drawBackground() {
    const { x, y, width, height } = this.config;
    this._background = this.scene.add.rectangle( x, y, width, height,
      this.config.backgroundColor );
    this._background.setOrigin( 0, 0 );
  }

  /**
   * Draws the health bar
   * @private
   */
  _drawHealthBar() {
    const { x, y, width, height } = this.config;
    this._bar = this.scene.add.rectangle( x, y, width, height,
      this.config.barColor );
    this._bar.setOrigin( 0, 0 );
  }

  /**
   * Destroys the health bar
   */
  destroy() {
    this._bar.destroy();
    this._border.destroy();
    this._background.destroy();
  }

  /**
   * Sets the health bar percentage
   * @param {number} percent The percentage
   */
  setPercent( percent ) {
    if ( percent < 0 ) {
      percent = 0;
    }
    else if ( percent > 1 ) {
      percent = 1;
    }
    this.setWidth( percent * this.config.width );
  }

  /**
   * Sets the width of the bar
   * @param {number} width The bar width
   */
  setWidth( width ) {
    this.scene.add.tween( {
      targets: this._bar,
      duration: this.config.animationDuration,
      width: width,
      ease: 'Linear'
    } );
  }

  /**
   * Sets the bar color
   * @param {number} color The new color
   */
  setBarColor( color ) {
    if ( !this._bar ) {
      return;
    }

    this._bar.fillColor = color;
  }

  /**
   * Sets the position of the health bar
   * @param {number} x The x-coordinate
   * @param {number} y The y-coordinate
   */
  setPosition( x, y ) {
    this.x = x;
    this.y = y;

    if ( this._border && this._background && this._bar ) {
      this._border.setPosition( x, y );
      this._background.setPosition( x, y );
      this._bar.setPosition( x, y );
    }
  }
}