/* Author:
            Code forked from Matthew Ruten at github.com/nomatteus
            All deltas and new features by Dylan Miller
*/

function game_toggle(game, force) {
  var interval = game.getInterval();
  if (force == "stop" || interval !== null) {
    // Stop
    clearInterval(interval);
    game.setTheInterval(null);
  } else {
    // start
    interval = setInterval(game.step, 100);
    game.setTheInterval(interval);
  }
}

var rule = "annihilation";


function add_listeners() {

  document.getElementById("start/pause").click(function(){
    console.log("start button clicked!");
    game_toggle(game);
  });

  document.getElementById("step").click(function(){
    console.log("step button clicked!");
    game_toggle(game, "stop");
    game.step();
  });
}

function startPauseClicked() {
  console.log("start button clicked this way!");
  game_toggle(game);
}

function stepButtonClicked() {
  console.log("step button clicked!");
  game_toggle(game, "stop");
  game.step();
}

//Roll values for each cell
//0 is dead
//1 is alive

var game_cells = [];
var random_number = Math.floor(Math.random()*100)+10;
for (var i=0; i < random_number; i++) {
  game_cells[i] = [];
  for (var j=0; j < random_number; j++) {
    game_cells[i][j] = Math.floor(Math.random()*2);
  }
}

var game = new GameOfLife({
  canvas_id: "gameWorldAnnihilation",
  cell_width: 10,
  cell_height: 10,
  init_cells: game_cells,
  rules: "attrition",
});
