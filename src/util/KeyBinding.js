const BINDINGS = {
  LEFT: Phaser.Input.Keyboard.KeyCodes.A,
  RIGHT: Phaser.Input.Keyboard.KeyCodes.D,
  UP: Phaser.Input.Keyboard.KeyCodes.W,
  DOWN: Phaser.Input.Keyboard.KeyCodes.S,
  INTERACT: Phaser.Input.Keyboard.KeyCodes.E,
  SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
  PAUSE: Phaser.Input.Keyboard.KeyCodes.ESC
};

/**
 * The KeyBinding utility class provides a convenient way to create key bindings
 * for a scene.
 */
export default class KeyBinding {
  /**
   * Creates a keys object based on the given bindings. This also adds the given
   * bindings to the given scene.
   * @param {Phaser.Scene} scene The current scene
   * @param {array} bindings An array of key bindings
   * @return {object} the constructed keys object
   */
  static createKeys( scene, bindings ) {
    const keys = {};
    bindings.forEach( ( binding ) => {
      keys[ binding ] = scene.input.keyboard.addKey(
        BINDINGS[ binding.toUpperCase() ] );
    } );
    return keys;
  }
}