/**
 * The health bar is a generic bar to display the health of an entity
 */
export default class HealthBar {
  /**
   * @param {Phaser.Scene} scene The current scene
   * @param {object} config The altered config
   */
  constructor( scene, config ) {
    this.scene = scene;
    this.config = this.mergeWithDefaultConfig( config );
    this.setPosition( this.config.x, this.config.y );
    this.drawBackground();
    this.drawBorder();
    this.drawHealthBar();
  }

  /**
   * Merges the given config with the defaults
   * @param  {object} config The given config
   * @return {object} the merged config object
   */
  mergeWithDefaultConfig( config ) {
    const defaultConfig = {
      width: 250,
      height: 40,
      x: 0,
      y: 0,
      background: { color: 0x651828 },
      bar: { color: 0xFF0000 },
      border: {
        color: 0x000000,
        width: 1
      },
      animationDuration: 200,
      flipped: false,
      isFixedToCamera: false
    };
    return Object.assign( {}, defaultConfig, config );
  }

  /**
   * Draws the border of the health bar
   */
  drawBorder() {
    const { x, y, width, height } = this.config;
    const bw = this.config.border.width;
    this.border = this.scene.add.rectangle( x - bw, y - bw,
      width + bw * 2, height + bw * 2 );
    this.border.setStrokeStyle( this.config.border.color );
    this.border.lineWidth = bw;
    this.border.setOrigin( 0, 0 );
  }

  /**
   * Draws the background of the health bar
   */
  drawBackground() {
    const { x, y, width, height } = this.config;
    this.background = this.scene.add.rectangle( x, y, width, height,
      this.config.background.color );
    this.background.setOrigin( 0, 0 );
  }

  /**
   * Draws the health bar
   */
  drawHealthBar() {
    const { x, y, width, height } = this.config;
    this.bar = this.scene.add.rectangle( x, y, width, height,
      this.config.bar.color );
    this.bar.setOrigin( 0, 0 );
  }

  /**
   * Destroys the health bar
   */
  destroy() {
    this.bar.destroy();
    this.border.destroy();
    this.background.destroy();
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
      targets: this.bar,
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
    if ( !this.bar ) {
      return;
    }

    this.bar.fillColor = color;
  }

  /**
   * Sets the position of the health bar
   * @param {number} x The x-coordinate
   * @param {number} y The y-coordinate
   */
  setPosition( x, y ) {
    this.x = x;
    this.y = y;

    if ( this.border && this.background && this.bar ) {
      this.border.setPosition( x, y );
      this.background.setPosition( x, y );
      this.bar.setPosition( x, y );
    }
  }
}