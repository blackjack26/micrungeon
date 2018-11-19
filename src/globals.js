const Direction = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3
};

const Orientation = {
  VERTICAL: 0,
  HORIZONTAL: 1
};

const Edge = {
  NONE: -1,
  TOP: 0,
  RIGHT: 1,
  BOTTOM: 2,
  LEFT: 3
};

const RoomType = {
  START: 0,
  BATTLE: 1,
  ITEM: 2,
  HALLWAY: 3,
  END: 4
};

export { Direction, Orientation, RoomType, Edge };