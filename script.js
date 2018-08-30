class Block{
    constructor(element){
        this.blockE = element;
        this.blockE.style.backgroundColor = "white";
    }
    
    isOn(){
        return this.blockE.style.backgroundColor != "white";
    }

    getColor(){
        return this.blockE.style.backgroundColor;
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

    // checks if placing the tetromino is not possible i.e. game is over
    gameOver(){
        return this.blocks.some(pos => grid[pos[0]][pos[1]].isOn());
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
        if (paused){return false;}

        // check if block is outside the grid
        var outside = positions.some(pos => pos[0] < 0 || pos[0] >= rows || pos[1] < 0 || pos[1] >= cols);
        if (outside){return false;}

        // check if block overlaps with another block from a different tetromino
        var overlap = positions.some(pos => grid[pos[0]][pos[1]].isOn() && !this.included(pos));
        return !overlap;
    }

    turnOffBlocks(){
        this.blocks.forEach(pos => {
            grid[pos[0]][pos[1]].turnOff();
        });
    }

    // turn off current blocks and turn on blocks in the new positions
    switchPosition(newPositions){
        this.turnOffBlocks();

        newPositions.forEach(pos => {
            grid[pos[0]][pos[1]].turnOn(this.color);
        });

        this.blocks = newPositions;
    }

    moveDown(){
        if (paused){return;}

        var newPositions = [];
        this.blocks.forEach(pos => {
            newPositions.push([pos[0] + 1, pos[1]]);
        });

        if (this.noCollision(newPositions)){
            this.center_row += 1;
            this.switchPosition(newPositions);
        }

        else{
            currentTetromino = null;
            clearInterval(this.fallSchedule);

            // clear any full rows
            grid.forEach(row => {
                if (rowFull(row)){
                    clearRow(row);
                }
            });

            // move rows down into place and call gameLoop by raising an event
            setTimeout(moveRowsDown, 200);
            setTimeout(function(){container.dispatchEvent(lockedInPlace);}, 300);
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
        this.blocks = [[center_row, center_col], [center_row - 1, center_col + 1],
                       [center_row - 1, center_col], [center_row, center_col + 1]];
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

// moves entire rows down at a time after rows have been cleared
function moveRowsDown(){
    var downAmount = 0; // ammount to move rows down by
    for (var i = rows - 1; i >= 0; i--){
        if (rowEmpty(grid[i])){
            downAmount += 1;
        }
        else{ // move row down by downAmount
            for (var j = 0; j < grid[i].length; j++){
                if (grid[i][j].isOn()){
                    var color = grid[i][j].getColor();
                    grid[i][j].turnOff();
                    grid[i+downAmount][j].turnOn(color);
                }
            }
        }
    }
}

function rowFull(row){
    return row.every(block => block.isOn());
}

function clearRow(row){
    row.forEach(block => block.turnOff());
}

function rowEmpty(row){
    return row.every(block => !block.isOn());
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
            newBlock.style.top = i*sideLength;
            newBlock.style.left = j*sideLength;
            
            container.appendChild(newBlock);
            row.push(new Block(newBlock));
        }
        grid.push(row)
    }

    // set size of overlay and container to match the grid
    var overlay = document.getElementById("overlay");
    overlay.style.width = (cols*sideLength + 20)+ "px";
    overlay.style.height = (rows*sideLength + 20) + "px";
    container.style.width = (cols*sideLength)+"px";
    container.style.height = (rows*sideLength)+ "px";

    return grid;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createTetromino(){
    var color = colors[getRandomInt(0, colors.length - 1)];

    var type = getRandomInt(0, 6);
    switch (type){
        case 0:
            newTet = new LTet1(1, cols/2, color);
            break;
        case 1:
            newTet = new LTet2(1, cols/2, color);
            break;
        case 2:
            newTet = new ZTet1(1, cols/2, color);
            break;
        case 3:
            newTet = new ZTet2(1, cols/2, color);
            break;
        case 4:
            newTet = new TTet(1, cols/2, color);
            break;
        case 5:
            newTet = new STet(1, cols/2, color);
            break;
        case 6:
            newTet = new ITet(1, cols/2, color);
            break;
    }
    return newTet;
}

function checkKey(key){
    if (currentTetromino == null){return;}

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

        case 80:
            paused = !paused;
            if (paused){
                displayMessage("Paused");
            }
            else{
                overlay.style.visibility = "hidden";
            }
            break;
    }
}

function clearBlock(){
    toClear[blockCounter].turnOff();

    blockCounter++;
    if (blockCounter == toClear.length){
        clearInterval(clearBlockSchedule);
        displayMessage("Game Over");
    }
}

function clearGrid(){
    // construct list of blocks to turn off
    toClear = [];
    grid.forEach(row => {
        row.forEach(block => {
            if (block.isOn()){
                toClear.push(block);
            }
        })
    });

    blockCounter = 0;
    clearBlockSchedule = setInterval(clearBlock, 50);
}

function displayMessage(message){
    overlay.style.visibility = "visible";
    displayText.textContent = message;
}

function reset(){
    // reset the game state, needed if reset() is called when paused
    if (currentTetromino != null){
        grid.forEach(row => { 
            clearRow(row);
        });
        clearInterval(currentTetromino.fallSchedule);
        paused = false;
    }

    overlay.style.visibility = "hidden";
    gameLoop();
}

function gameLoop(){
    var newTet = createTetromino();

    if (!newTet.gameOver()){
        newTet.activate();
        currentTetromino = newTet;
    }
    else{
        // flash Tetromino
        var turnOff = function(){newTet.turnOffBlocks();};
        var turnOn = function(){newTet.switchPosition(newTet.blocks);};

        turnOn();
        setTimeout(turnOff, 1000);
        setTimeout(turnOn, 2000);
        setTimeout(turnOff, 3000);
        setTimeout(turnOn, 4000);
        
        // remove every block one by one, once finished display the Game Over Screen
        setTimeout(clearGrid, 5000); 
    }
}

const rows = 18;
const cols = 10;
const sideLength = 40;
const timeInterval = 1000;
const colors = ["Aqua", "DarkOrange", "DeepPink", "Fuchsia", "Red", "Blue", "Lime", "Green"];

// used for Game over animation
let clearBlockSchedule;
let toClear;
let blockCounter;

let currentTetromino;
var grid = [];
var paused = false;
var lockedInPlace = new CustomEvent("lockedInPlace"); // track when a block is locked into place