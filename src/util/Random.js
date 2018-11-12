import seedrandom from 'seedrandom';

/**
 * A utility class that provides functions for random number generation based
 * on a given seed value
 */
export default class Random {
  /**
   * @param {number} seedValue The seed value for RNG
   */
  constructor( seedValue ) {
    this.rng = seedrandom( seedValue );
  }

  /**
   * Gets a random integer
   * @param {number} min The minimum value the integer can be
   * @param {number} max The maximum value the integer can be
   * @param {boolean|undefined} even True = Only Even, False = Only Odd,
   *  Undefined = Odd and Even
   * @return {number} A random integer
   */
  randInt( min, max, even = undefined ) {
    if ( even === true ) {
      return this.randEvenInt( min, max );
    }
    else if ( even === false ) {
      return this.randOddInt( min, max );
    }
    return Math.floor( this.rng() * ( max - min + 1 ) + min );
  }

  /**
   * Gets a random even integer
   * @param {number} min The minimum value the integer can be
   * @param {number} max The maximum value the integer can be
   * @return {number} A random even integer
   */
  randEvenInt( min, max ) {
    if ( min % 2 !== 0 && min < max ) {
      min++;
    }
    if ( max % 2 !== 0 && max > min ) {
      max--;
    }
    const range = ( max - min ) / 2;
    return Math.floor( this.rng() * ( range + 1 ) ) * 2 + min;
  }

  /**
   * Gets a random odd integer
   * @param {number} min The minimum value the integer can be
   * @param {number} max The maximum value the integer can be
   * @return {number} A random odd integer
   */
  randOddInt( min, max ) {
    if ( min % 2 === 0 ) {
      min++;
    }
    if ( max % 2 === 0 ) {
      max--;
    }
    const range = ( max - min ) / 2;
    return Math.floor( this.rng() * ( range - 1 ) ) * 2 + min;
  }

  /**
   * Gets a random direction (North, East, South, West)
   * @return {number} A random direction
   */
  randDirection() {
    return this.randInt( 0, 3 );
  }

  /**
   * Gets a random value in the given array
   * @param {Array} array The array to choose from
   * @return {*} The chosen value of the array
   */
  randPick( array ) {
    return array[ this.randInt( 0, array.length - 1 ) ];
  }
}