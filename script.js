class Block{
    constructor(element){
        this.blockE = element;
        this.blockE.style.backgroundColor = "white";
    }
    
    isOn(){
        return this.blockE.style.backgroundColor != "white";
    }
    
    turnOff(){
        this.blockE.style.backgroundColor = "white";
    }

    turnOn(color){
        this.blockE.style.backgroundColor = color;
    }
}

class Tetromino {
    constructor(center_row, center_col, color){
        this.center_row = center_row;
        this.center_col = center_col;
        this.color = color; 
        this.blocks = [];
    }

    // turns on the tetromino (only used once after initialisation)
    activate(){
        this.switchPosition(this.blocks);

        // start moving the tetromino
        var t = this;
        this.fallSchedule = setInterval(function(){t.moveDown();}, timeInterval);
    }

    // checks if a block at position in the grid is part of the tetromino
    included(position){
        return this.blocks.some(pos => pos[0] == position[0] && pos[1] == position[1]);
    }

    // returns false if the new configuration of blocks is not allowed, otherwise returns true
    noCollision(positions){
        // check if block is outside the grid
        var outside = positions.some(pos => pos[0] < 0 || pos[0] >= rows || pos[1] < 0 || pos[1] >= cols);
        if (outside){return false;}

        // check if block overlaps with another block from a different tetromino
        var overlap = positions.some(pos => grid[pos[0]][pos[1]].isOn() && !this.included(pos));
        return !overlap;
    }

    // turn off current blocks and turn on blocks in the new positions
    switchPosition(newPositions){
        this.blocks.forEach(pos => {
            grid[pos[0]][pos[1]].turnOff();
        });

        newPositions.forEach(pos => {
            grid[pos[0]][pos[1]].turnOn(this.color);
        });

        this.blocks = newPositions;
    }

    moveDown(){
        var newPositions = [];
        this.blocks.forEach(pos => {
            newPositions.push([pos[0] + 1, pos[1]]);
        });

        if (this.noCollision(newPositions)){
            this.center_row += 1;
            this.switchPosition(newPositions);
        }

        else{
            clearInterval(this.fallSchedule);
            spawnTetromino();
        }
    }

    moveLeft(){
        var newPositions = [];
        this.blocks.forEach(pos => {
            newPositions.push([pos[0], pos[1] - 1]);
        });

        if (this.noCollision(newPositions)){
            this.center_col -= 1;
            this.switchPosition(newPositions);
        }
    }

    moveRight(){
        var newPositions = [];
        this.blocks.forEach(pos => {
            newPositions.push([pos[0], pos[1] + 1]);
        });

        if (this.noCollision(newPositions)){
            this.center_col += 1;
            this.switchPosition(newPositions);
        }
    }

    // drop the object by increasing the speed it falls
    drop(){
        clearInterval(this.fallSchedule);
        var t = this;
        this.fallSchedule = setInterval(function(){t.moveDown();}, timeInterval/100);
    }

    // converts the location of the Tetrominos blocks on the grid into
    // the location of the blocks from the center of the Tetromino
    // also performs the reverse operation
    blockDistanceFromCenter(grid){
        var matrix = [];
        grid.forEach(pos => {
            matrix.push([this.center_row - pos[0], this.center_col - pos[1]]);
        });
        return matrix;
    }

    // rotate a Tetromino around it's center (direction = -1 means anti clockwise)
    // uses the fact that if the dot product of two vectors is 0 they are perpendicular
    rotate(direction){
        var centerDistances = this.blockDistanceFromCenter(this.blocks);

        var rotated = [];
        centerDistances.forEach(pos => {
            rotated.push([-direction*pos[1], direction*pos[0]]);
        });

        rotated = this.blockDistanceFromCenter(rotated);
        if (this.noCollision(rotated)){
            this.switchPosition(rotated);
        }
    }
}

class LTet1 extends Tetromino {
    constructor(center_row, center_col, color){
        super(center_row, center_col, color);
        this.blocks = [[center_row, center_col], [center_row + 1, center_col + 1],
                       [center_row - 1, center_col], [center_row + 1, center_col]];
    }
}

class LTet2 extends Tetromino {
    constructor(center_row, center_col, color){
        super(center_row, center_col, color);
        this.blocks = [[center_row, center_col], [center_row + 1, center_col - 1],
                       [center_row - 1, center_col], [center_row + 1, center_col]];
    }
}

class ZTet1 extends Tetromino {
    constructor(center_row, center_col, color){
        super(center_row, center_col, color);
        this.blocks = [[center_row, center_col], [center_row + 1, center_col + 1],
                       [center_row - 1, center_col], [center_row, center_col + 1]];
    }
}

class ZTet2 extends Tetromino {
    constructor(center_row, center_col, color){
        super(center_row, center_col, color);
        this.blocks = [[center_row, center_col], [center_row - 1, center_col + 1],
                       [center_row + 1, center_col], [center_row, center_col + 1]];
    }
}

class TTet extends Tetromino {
    constructor(center_row, center_col, color){
        super(center_row, center_col, color);
        this.blocks = [[center_row, center_col], [center_row + 1, center_col],
                       [center_row - 1, center_col], [center_row, center_col + 1]];
    }
}

class STet extends Tetromino {
    constructor(center_row, center_col, color){
        super(center_row, center_col, color);
        this.blocks = [[center_row, center_col], [center_row + 1, center_col + 1],
                       [center_row + 1, center_col], [center_row, center_col + 1]];
    }

    rotate(){} //square shouldn't rotate
}

class ITet extends Tetromino {
    constructor(center_row, center_col, color){
        super(center_row, center_col, color);
        this.blocks = [[center_row, center_col], [center_row + 1, center_col],
                       [center_row - 1, center_col], [center_row + 2, center_col]];
    }
}

// dynamically create a grid of divs with CSS class block
// then create Blocks and add them to the grid so they can be manipulated by js
function createGrid(){
    var grid = [];
    var lengthStr = sideLength+"px";

    for (i = 0; i < rows; i++){
        var row = [];
        
        for (j = 0; j < cols; j++){
            var id = i*rows + j;
            var newBlock = document.createElement("div");
            newBlock.className = "block";
            newBlock.id = id;
            
            newBlock.style.width = lengthStr;
            newBlock.style.height = lengthStr;
            newBlock.style.top = 10 + i*sideLength;
            newBlock.style.left = 10 + j*sideLength;
            
            var container = document.getElementById("container");
            container.appendChild(newBlock);
            row.push(new Block(newBlock));
        }
        grid.push(row)
    }
    return grid;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// main game loop
function spawnTetromino(){
    var color = colors[getRandomInt(0, colors.length - 1)];

    var type = getRandomInt(0, 6);
    switch (type){
        case 0:
            newTet = new LTet1(1, 3, color);
            break;
        case 1:
            newTet = new LTet2(1, 3, color);
            break;
        case 2:
            newTet = new ZTet1(1, 3, color);
            break;
        case 3:
            newTet = new ZTet2(1, 3, color);
            break;
        case 4:
            newTet = new TTet(1, 3, color);
            break;
        case 5:
            newTet = new STet(1, 3, color);
            break;
        case 6:
            newTet = new ITet(1, 3, color);
            break;
    }

    newTet.activate();
    currentTetromino = newTet;
}

function checkKey(key){
    switch (key.keyCode){
        case 38: 
            currentTetromino.rotate(-1);
            break;

        case 40:
            currentTetromino.rotate(1);
            break;
        
        case 37:
            currentTetromino.moveLeft();
            break;

        case 39:
            currentTetromino.moveRight();
            break;

        case 32:
            currentTetromino.drop();
            break;
    }
}

const rows = 12;
const cols = 8;
const sideLength = 50;
const timeInterval = 1000;
const colors = ["Aqua", "DarkOrange", "DeepPink", "Fuchsia", "Maroon", "Blue", "Lime", "Green"];

let grid;
let currentTetromino;