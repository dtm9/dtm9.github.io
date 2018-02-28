/* Author:
            Code forked from Matthew Ruten at github.com/nomatteus
            All deltas and new features for Game of Death/species fighting logic by Dylan Miller
*/

var GameOfLife = function(params){
  // User-set params
  var num_cells_y = params["init_cells"].length,
      num_cells_x = params["init_cells"][0].length,
      cell_width  = params["cell_width"]  || 10,
      cell_height = params["cell_height"] || 10,
      init_cells  = params["init_cells"]  || [],
      canvas_id   = params["canvas_id"]   || "life",
      fight_rules = params["rules"],

      cell_array = [],
      display     = new GameDisplay(num_cells_x, num_cells_y, cell_width, cell_height, canvas_id),
      interval = null,    // Will store reference to setInterval method -- this should maybe be part of GameDisplay

      init        = function() {
        // Convert init_cells array of 0's and 1's to actual Cell objects
        var length_y = init_cells.length,
            length_x,
            y, x;
        // each row
        for (y = 0; y < length_y; y++) {
          length_x = init_cells[y].length;
          // each column in rows
          for (x = 0; x < length_x; x++) {
            var state = (init_cells[y][x] == 1) ? 'alive' : 'dead';
            var species;
            if (state === "alive") {
              if (Math.random() >= 0.5) {
                species = "green";
              } else {
                species = "red";
              }
            }
            init_cells[y][x] = new Cell(x, y, state, species);
          }
        }
        cell_array = init_cells;
        display.update(cell_array);
      },
      // Function to calculate the next generation of cells, based
      //  on the rules of the Game of Life
      nextGenCells = function() {
        // Implement the Game of Life rules
        // Simple algorithm:
        //  - For each cell:
        //      - Check all of its neighbours
        //      - Based on the rules, set the next gen cell to alive or dead

        var current_gen = cell_array,
            next_gen = [],      // New array to hold the next gen cells
            length_y = cell_array.length,
            length_x,
            y, x;
        // each row
        for (y = 0; y < length_y; y++) {
          length_x = current_gen[y].length;
          next_gen[y] = []; // Init new row
          // each column in rows
          for (x = 0; x < length_x; x++) {
            //var state = (init_cells[y][x] == 1) ? 'alive' : 'dead';
            var cell = current_gen[y][x];
            // Calculate above/below/left/right row/column values
            var row_above = (y-1 >= 0) ? y-1 : length_y-1; // If current cell is on first row, cell "above" is the last row (stitched)
            var row_below = (y+1 <= length_y-1) ? y+1 : 0; // If current cell is in last row, then cell "below" is the first row
            var column_left = (x-1 >= 0) ? x-1 : length_x - 1; // If current cell is on first row, then left cell is the last row
            var column_right = (x+1 <= length_x-1) ? x+1 : 0; // If current cell is on last row, then right cell is in the first row

            var neighbours = {
              top_left: current_gen[row_above][column_left].clone(),
              top_center: current_gen[row_above][x].clone(),
              top_right: current_gen[row_above][column_right].clone(),
              left: current_gen[y][column_left].clone(),
              right: current_gen[y][column_right].clone(),
              bottom_left: current_gen[row_below][column_left].clone(),
              bottom_center: current_gen[row_below][x].clone(),
              bottom_right: current_gen[row_below][column_right].clone()
            };

            var alive_count = 0;
            var dead_count = 0;
            var foe_count = 0;
            for (var neighbour in neighbours) {
              if (neighbours[neighbour].getState() == "dead") {
                dead_count++;
              } else if (neighbours[neighbour].getSpecies() == cell.getSpecies()) {
                //only count life if it matches the species
                alive_count++;
              } else {
                foe_count++;
              }
            }

            // Set new state to current state, but it may change below
            var new_state = cell.getState();
            var new_species = cell.getSpecies();
            if (cell.getState() == "alive") { //center cell is alive
              if (alive_count < 2 || alive_count > 3) {
                // new state: dead, overpopulation/ underpopulation
                new_state = "dead";
              } else if (alive_count === 2 || alive_count === 3) {
                // lives on to next generation
                new_state = "alive";
              }

              //Annihilation method
              /*
                If the battle is won, kill all foes. If the battle is lost kill the center cell only.

                Math.random() will roll a number between zero and 1, it must be less than or equal to alive_count/foe_count. So if
                allies outnumber the foes it is a garuenteed win, such is life in times of war. Since Math.random() will never be bigger than one,
                this math works out.
              */
              var victory_chance = Math.random();


              if (fight_rules == "annihilation" && new_state != "dead" && foe_count > 0) { //if there's going to be a fight
              //console.log("there's a annihilation coming!");
                if (victory_chance <= (alive_count/foe_count)) { //victory
                  for (var neighbour in neighbours) {
                    if (neighbours[neighbour].getState() == "alive" && neighbours[neighbour].getSpecies() != new_species) { //at this stage new_species has not changed from what it was before for center cell
                      console.log("neighbour was " + neighbours[neighbour].getSpecies() + " and I am " + new_species + " so its dying now");
                      neighbours[neighbour].setState("dead");
                    }
                  }
                } else { //defeat
                  new_state = "dead";
                }
              } //else no fight no action


              //Attrition Method
            /*
              If the battle is won, kill at random a number of foes equal to the number of allies, or all of them if they are outnumbered.
              This is meant to simulate a classic, drawn out engagement such as trench warfare.
            */
              if (fight_rules == "attrition" && new_state != "dead" && foe_count > 0) { //if there's going to be a fight
                //console.log("there's a attrition coming!");
                if (victory_chance <= (alive_count/foe_count)) { //victory
                  if (alive_count > foe_count) { //outnumbered foes, kill them all
                    for (var neighbour in neighbours) {
                      if (neighbours[neighbour].getState() == "alive" && neighbours[neighbour].getSpecies() != new_species) { //at this stage new_species has not changed from what it was before for center cell
                        console.log("neighbour was " + neighbours[neighbour].getSpecies() + " and I am " + new_species + " so its dying now");
                        neighbours[neighbour].setState("dead");
                      }
                    }
                  } else { //winning side had fewer combatants. Kill that many foes
                    var foes = [];
                    var i = 0;
                    for (var neighbour in neighbours) { //get the foes in a list
                      if (neighbours[neighbour].getState() == "alive" && neighbours[neighbour].getSpecies() != new_species) { //if a living foe
                        foes[i] = neighbours[neighbour];
                        i++;
                      }
                    }
                    for (var j = 0; j < alive_count; j++) { //for alive_count number of foes in foes[]
                      foes[j].setState("dead");
                    }
                  }
                } else { //defeat
                  new_state = "dead";
                }
              }
            } else { //center cell was originally dead
              if (alive_count === 3) {
                // new state: live, reproduction
                new_state = "alive";
                if (alive_count < foe_count) { //species must change, this birth belongs to the dominant species
                  if (new_species === "green") {
                    new_species = "red";
                  } else { //it was red
                    new_species = "green";
                  }
                } //else no change in species do nothing
              }
            }

            next_gen[y][x] = new Cell(x, y, new_state, new_species);
          }
        }
        return next_gen;
      }
  ;
  init();
  return {
    // Returns the next generation array of cells
    step: function(){
      var next_gen = nextGenCells();
      // Set next gen as current cell array
      cell_array = next_gen;
      display.update(cell_array);
    },
    // Returns the current generation array of cells
    getCurrentGenCells: function() {
      return cell_array;
    },
    setTheInterval: function(the_interval) {
      interval = the_interval;
    },
    getInterval: function() {
      return interval;
    },
    getRules: function() {
      return fight_rules;
    },
    loadSavedGame: function(savedata) {
      num_cells_x = savedata.nodes.length;
      num_cells_y = savedata.nodes[0].length;
      cell_array = savedata.nodes;

      for (var y = 0; y < num_cells_y; y++) {
        for (var x = 0; x < num_cells_x; x++) {
          cell_array[y][x] = new Cell(x, y, cell_array[y][x].state, cell_array[y][x].species);
        }
      }

      display     = new GameDisplay(num_cells_x, num_cells_y, 10, 10, "gameWorldAnnihilation");
      display.update(cell_array);
    }
  };
};


// This is an object that will take care of all display-related features.
var GameDisplay = function(num_cells_x, num_cells_y, cell_width, cell_height, canvas_id) {
  var canvas = document.getElementById(canvas_id),
      ctx = canvas.getContext && canvas.getContext('2d'),
      width_pixels = num_cells_x * cell_width,
      height_pixels = num_cells_y * cell_height,

      updateCells = function(cell_array) {
        var length_y = cell_array.length,
            length_x,
            y, x;
        // each row
        for (y = 0; y < length_y; y++) {
          length_x = cell_array[y].length;
          // each column in rows
          for (x = 0; x < length_x; x++) {
            // Draw Cell on Canvas
            drawCell(cell_array[y][x]);
          }
        }
      },
      drawCell = function(cell) {
        // find start point (top left)
        var start_x = cell.getXPos() * cell_width,
            start_y = cell.getYPos() * cell_height;
            species = cell.getSpecies();
        // draw rect from that point, to bottom right point by adding cell_height/cell_width
        if (cell.getState() == "alive") {
          //console.log("it's alive!");
          //ctx.fillRect(start_x, start_y, cell_width, cell_height);
          switch (species) {
            case "green":
              ctx.fillStyle = 'green';
              ctx.fillRect(start_x, start_y, cell_width, cell_height);
              break;
            case "red":
              ctx.fillStyle = 'red';
              ctx.fillRect(start_x, start_y, cell_width, cell_height);
              break;
            default:
              console.log("species is " + species + " defaulting to black color.");
              ctx.fillStyle = 'black';
              ctx.fillRect(start_x, start_y, cell_width, cell_height);
          }
        } else { //dead
          ctx.clearRect(start_x, start_y, cell_width, cell_height);
        }
      },
      init = function() {

        // Resize Canvas
        canvas.width = width_pixels;
        canvas.height = height_pixels;


      };
  init();
  return {
    update: function(cell_array) {
      updateCells(cell_array);
    }
  };


};

var Cell = function(x_pos, y_pos, state, species) {
  //console.log("Creating cell at " + x_pos + "," + y_pos + ", and cell state is: " + state);
  /*var x_pos = 0,        // X Position of Cell in Grid
      y_pos = 0,        // Y position of cell in Grid
      state = "dead",   // Cell state: dead or alive.
  */
  return {
    x_pos: x_pos,
    y_pos: y_pos,
    state: state,
    species: species,
    getXPos: function() {
      return x_pos;
    },
    getYPos: function() {
      return y_pos;
    },
    getState: function() {
      return state;
    },
    setState: function(new_state) {
      state = new_state;
    },
    getSpecies: function() {
      return species;
    },
    setSpecies: function(new_species) {
      species = new_species;
    },
    clone: function() {
      return new Cell(x_pos, y_pos, state, species);
    }
  };
};
