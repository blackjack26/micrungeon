import Tiles from './Tiles';

/**
 * Logs the dungeon map to the console in a colored table structure
 * @param {Dungeon} dungeon The dungeon to map
 * @param {object} config The debug map configuration
 */
export function debugMap( dungeon, config = {} ) {
  config = Object.assign(
    {},
    {
      empty: ' ',
      emptyColor: 'rgb(0, 0, 0)',
      wall: '#',
      wallColor: 'rgb(255, 0, 0)',
      floor: '=',
      floorColor: 'rgb(210, 210, 210)',
      door: '.',
      doorColor: 'rgb(0, 0, 255)',
      start: 'S',
      end: 'E',
      battle: 'I',
      startColor: 'rgb(0, 0, 0)',
      fontSize: '15px'
    },
    config
  );

  let string = '';
  const styles = [];

  // First line in the browser console window has console line mapping
  // (e.g. "dungeon.js:724") which throws off the table. Kill two birds by
  // displaying a guide on the first two lines.
  string += 'Dungeon: the console window should be big enough to see all of '
    + 'the guide on the next line:\n';
  string += `%c|${'='.repeat( dungeon.width * 2 - 2 )}|\n\n`;
  styles.push( `font-size: ${config.fontSize}` );

  for ( let y = 0; y < dungeon.height; y += 1 ) {
    for ( let x = 0; x < dungeon.width; x += 1 ) {
      const tile = dungeon.tiles[ y ][ x ];
      if ( tile === Tiles.EMPTY ) {
        string += `%c${config.empty}`;
        styles.push(
          `color: ${config.emptyColor}; font-size: ${config.fontSize}` );
      }
      else if ( tile === Tiles.WALL ) {
        string += `%c${config.wall}`;
        styles.push(
          `color: ${config.wallColor}; font-size: ${config.fontSize}` );
      }
      else if ( tile === Tiles.FLOOR ) {
        string += `%c${config.floor}`;
        styles.push(
          `color: ${config.floorColor}; font-size: ${config.fontSize}` );
      }
      else if ( tile === Tiles.DOOR ) {
        string += `%c${config.door}`;
        styles.push(
          `color: ${config.doorColor}; font-size: ${config.fontSize}` );
      }
      else if ( tile === Tiles.START ) {
        string += `%c${config.start}`;
        styles.push(
          `color: ${config.startColor}; font-size: ${config.fontSize}` );
      }
      else if ( tile === Tiles.END ) {
        string += `%c${config.end}`;
        styles.push(
          `color: ${config.startColor}; font-size: ${config.fontSize}` );
      }
      else if ( tile === Tiles.ITEM ) {
        string += `%c${config.battle}`;
        styles.push(
          `color: ${config.startColor}; font-size: ${config.fontSize}` );
      }
      string += ' ';
    }
    string += '\n';
  }
  console.log( string, ...styles );
}