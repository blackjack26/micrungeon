const TILES = {
  BLANK: 19,
  WALL: {
    TOP_LEFT: 3,
    TOP_RIGHT: 4,
    BOTTOM_LEFT: 11,
    BOTTOM_RIGHT: 12,
    TOP: 17,
    RIGHT: 8,
    BOTTOM: 1,
    LEFT: 10
  },
  CORNER: {
    TOP_LEFT: 0,
    TOP_RIGHT: 2,
    BOTTOM_LEFT: 16,
    BOTTOM_RIGHT: 18
  },
  FLOOR: 9,
  DOOR: {
    TOP: {
      LEFT: [ 10, 9, 16 ],
      MIDDLE: [ 18, 9, 16 ],
      RIGHT: [ 18, 9, 8 ]
    },
    BOTTOM: {
      LEFT: [ 10, 9, 0 ],
      MIDDLE: [ 2, 9, 0 ],
      RIGHT: [ 2, 9, 8 ]
    },
    LEFT: {
      TOP: [ [ 17 ], [ 9 ], [ 2 ] ],
      MIDDLE: [ [ 18 ], [ 9 ], [ 2 ] ],
      BOTTOM: [ [ 18 ], [ 9 ], [ 1 ] ]
    },
    RIGHT: {
      TOP: [ [ 17 ], [ 9 ], [ 0 ] ],
      MIDDLE: [ [ 16 ], [ 9 ], [ 0 ] ],
      BOTTOM: [ [ 16 ], [ 9 ], [ 1 ] ]
    }
  },
  GATE: {
    HORIZONTAL: [ 24, 25, 26 ],
    VERTICAL: [ [ 32 ], [ 40 ] ]
  }
};

export default TILES;