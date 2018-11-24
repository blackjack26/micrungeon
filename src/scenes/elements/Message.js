/**
 * A display message that appears
 */
export default class Message {
  /**
   * Creates a status message at the bottom of the screen
   * @param {string} msg The message to display
   * @param {Phaser.Scene} scene The scene to show the message on
   */
  static status( msg, scene ) {
    if ( scene.statusMsg ) {
      clearTimeout( scene.statusMsg.fadeTimeout );
      clearTimeout( scene.statusMsg.removeTimeout );
      scene.statusMsg.destroy();
    }

    scene.statusMsg = scene.add.text( -scene.game.config.width / 2,
      scene.game.config.height - 30, msg, {
        fontSize: '16px',
        fontFamily: 'Rye',
        color: '#FFF'
      } );
    scene.statusMsg.setPosition( scene.statusMsg.x - scene.statusMsg.width / 2,
      scene.statusMsg.y );
    scene.statusMsg.setShadow( 0, 2, '#000', 10 );
    scene.statusMsg.fadeTimeout = setTimeout( () => {
      scene.tweens.add( {
        targets: scene.statusMsg,
        duration: 1000,
        alpha: 0,
        ease: 'Linear'
      } );
      scene.statusMsg.removeTimeout = setTimeout( () => {
        scene.statusMsg.destroy();
        scene.statusMsg = null;
      }, 1000 );
    }, 1500 );
  }
}