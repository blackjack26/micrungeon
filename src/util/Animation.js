/**
 * Creates all of the animations for entities
 * @param {Phaser.Scene} scene The scene to add the animation to
 */
function createAnimations( scene ) {
  // TODO: DELETE THIS SAMPLE
  addDynamicAnim( scene, 'sample', 'sample/frame', 'sample-sprites', 1, 3, 5 );
}

/**
 * Adds a static animation to the given scene. A static animation is a one
 * frame animation that doesn't change.
 * @param {Phaser.Scene} scene The scene to add the animation to
 * @param {string} animKey  The key that the animation will be associated with
 * @param {string} frameKey The key that describes the filename in the JSON
 * @param {string} atlasKey The key that describes the loaded Atlas
 */
function addStaticAnim( scene, animKey, frameKey, atlasKey ) {
  scene.anims.create( {
    key: animKey,
    frames: [ {
      frame: frameKey,
      key: atlasKey
    } ]
  } );
}

/**
 * Adds a dynamic animation to the given scene. A dynamic animation is a
 * tradition animation where it looks like the entity is moving.
 * @param {Phaser.Scene} scene The scene to add the animation to
 * @param {string} animKey The key that the animation will be associated with
 * @param {string} framePrefix The prefix of the key that describes the file
 * @param {string} atlasKey The key that describes the loaded Atlas
 * @param {Number} start The number of the first frame
 * @param {Number} end The number of the last frame
 * @param {Number} [frameRate=10] The frame rate of playback in fps
 * @param {Number} [repeat=-1] Number of times to repeat the animation (-1
 *  for infinity)
 * @param {Number} [repeatDelay=0] Delay before the animation repeats. Value
 *  given in milliseconds.
 */
function addDynamicAnim( scene, animKey, framePrefix, atlasKey, start, end,
  frameRate = 10, repeat = -1, repeatDelay = 0 ) {
  scene.anims.create( {
    key: animKey,
    frames: scene.anims.generateFrameNames( atlasKey, {
      prefix: framePrefix,
      start: start,
      end: end
    } ),
    frameRate: frameRate,
    repeat: repeat,
    repeatDelay: repeatDelay
  } );
}

export {
  addStaticAnim,
  addDynamicAnim,
  createAnimations
};