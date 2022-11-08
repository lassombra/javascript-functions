function seed() {
  return [...arguments];
}

function same([x, y], [j, k]) {
  return x === j && y === k;
}

// The game state to search for `cell` is passed as the `this` value of the function.
function contains(cell) {
  return !!this.find(a => same(a, cell));
}

const printCell = (cell, state) => {
  return contains.call(state, cell) ? '\u25A3' : '\u25A2';
};

const corners = (state = []) => {
  if (state.length === 0) {
    return {
      topRight: [0,0],
      bottomLeft: [0,0]
    }
  }
  const [x,y] = state.reduce((axis, cell) => {
    axis[0].push(cell[0]);
    axis[1].push(cell[1]);
    return axis;
  }, [[], []]);
  x.sort();
  y.sort();
  return {
    topRight: [x.slice(-1)[0], y.slice(-1)[0]],
    bottomLeft: [x[0], y[0]]
  }
};
function iterateCells(bounds = {topRight: [0, 0], bottomLeft: [0, 0]},
                      cellFn = () => {/* noop */},
                      rowFn = () => { /* noop */},
                      postRowFn = () => {/* noop */}) {
  for (let y = bounds.topRight[1]; y >= bounds.bottomLeft[1]; y--) {
    let rowVal = rowFn();
    for (let x = bounds.bottomLeft[0]; x <= bounds.topRight[0]; x++) {
      cellFn([x,y], rowVal);
    }
    postRowFn(rowVal);
  }
}
const printCells = (state) => {
  const myCorners = corners(state);
  const rows = [];
  iterateCells(myCorners, (cell, row) => row.push(printCell(cell, state)), () => [],
      row => rows.push(row.join(' ') + '\n'));
  return rows.join('');
};

const getNeighborsOf = ([x, y]) => {return [
    [x-1, y+1], [x, y+1], [x+1, y+1],
    [x-1, y], /*[x,y],*/ [x+1, y],
    [x-1, y-1], [x, y-1], [x+1, y-1]
]};

const getLivingNeighbors = (cell, state) => {
  const living = contains.bind(state);
  return getNeighborsOf(cell).filter(living);
};

const willBeAlive = (cell, state) => {
  const neighbors = getLivingNeighbors(cell, state).length;
  return neighbors === 3 ||  contains.call(state, cell) && neighbors === 2;
};

function expandCornersBy(existingCorners, factor) {
  return {
    topRight: [existingCorners.topRight[0] + factor,
      existingCorners.topRight[1] + factor],
    bottomLeft: [existingCorners.bottomLeft[0] - factor,
        existingCorners.bottomLeft[1] - factor]
  }
}
const calculateNext = (state) => {
  const newState = [];
  iterateCells(expandCornersBy(corners(state), 1), cell => {
    if (willBeAlive(cell, state)) {
      newState.push(cell);
    }
  }, () => {/*noop*/
  })
  return newState;
};

const iterate = (state, iterations) => {
  const states = [state];
  let currentState = state;
  for (let i = 0; i < iterations; i++) {
    currentState = calculateNext(currentState);
    states.push(currentState);
  }
  return states;
};

const main = (pattern, iterations) => {
  let  states = iterate(startPatterns[pattern], iterations);
  states = states.map(printCells);
  console.log(states.join('\n'));
};

const startPatterns = {
    rpentomino: [
      [3, 2],
      [2, 3],
      [3, 3],
      [3, 4],
      [4, 4]
    ],
    glider: [
      [-2, -2],
      [-1, -2],
      [-2, -1],
      [-1, -1],
      [1, 1],
      [2, 1],
      [3, 1],
      [3, 2],
      [2, 3]
    ],
    square: [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2]
    ]
  };
  
  const [selectedPattern, numIterations] = process.argv.slice(2);
  const runAsScript = require.main === module;
  
  if (runAsScript) {
    if (startPatterns[selectedPattern] && !isNaN(parseInt(numIterations))) {
      main(selectedPattern, parseInt(numIterations));
    } else {
      console.log("Usage: node js/gameoflife.js rpentomino 50");
    }
  }
  
  exports.seed = seed;
  exports.same = same;
  exports.contains = contains;
  exports.getNeighborsOf = getNeighborsOf;
  exports.getLivingNeighbors = getLivingNeighbors;
  exports.willBeAlive = willBeAlive;
  exports.corners = corners;
  exports.calculateNext = calculateNext;
  exports.printCell = printCell;
  exports.printCells = printCells;
  exports.startPatterns = startPatterns;
  exports.iterate = iterate;
  exports.main = main;