class Block{
    constructor(element){
        this.blockE = element;
    }
    
    isOn(){
        return this.blockE.style.backgroundColor == "lime";
    }
    
    turnOff(){
        this.blockE.style.backgroundColor = "white";
    }

    turnOn(){
        this.blockE.style.backgroundColor = "lime";
    }
}

class Tetromino {
    constructor(center_row, center_col){
        this.center_row = center_row;
        this.center_col = center_col; 
        this.blocks = [];
    }

    // turns on the tetromino (only used once after initialisation)
    activate(){
        this.blocks.forEach(pos => {
            grid[pos[0]][pos[1]].turnOn();
        });

        // start moving the tetromino
        var t = this;
        this.gravitySchedule = setInterval(function(){t.moveDown();}, timeInterval);
    }

    // checks if a block at position in the grid is part of the tetromino
    included(position){
        return this.blocks.some(pos => pos[0] == position[0] && pos[1] == position[1]);
    }

    // returns false if the new configuration of blocks is not allowed, otherwise returns true
    noCollision(positions){
        //check if block is outside the grid
        var outside = positions.some(pos => pos[0] < 0 || pos[0] >= rows || pos[1] < 0 || pos[1] >= cols);
        if (outside){return false;}

        //check if block overlaps with another block from a different tetromino
        var overlap = positions.some(pos => grid[pos[0]][pos[1]].isOn() && !this.included(pos));
        return !overlap;
    }

    // turn off current blocks and turn on blocks in the new positions
    switchPosition(newPositions){
        this.blocks.forEach(pos => {
            grid[pos[0]][pos[1]].turnOff();
        });

        newPositions.forEach(pos => {
            grid[pos[0]][pos[1]].turnOn();
        });

        this.blocks = newPositions;
    }

    moveDown(){
        var newPositions = [];
        this.blocks.forEach(pos => {
            newPositions.push([pos[0] + 1, pos[1]]);
        });

        if (this.noCollision(newPositions)){
            this.switchPosition(newPositions);
        }

        else{
            clearInterval(this.gravitySchedule);
            spawnTetromino();
        }
    }

    moveLeft(){
        var newPositions = [];
        this.blocks.forEach(pos => {
            newPositions.push([pos[0], pos[1] - 1]);
        });

        if (this.noCollision(newPositions)){
            this.switchPosition(newPositions);
        }
    }

    moveRight(){
        var newPositions = [];
        this.blocks.forEach(pos => {
            newPositions.push([pos[0], pos[1] + 1]);
        });

        if (this.noCollision(newPositions)){
            this.switchPosition(newPositions);
        }
    }

    drop(){
        
    }

    //to be defined in sub clases
    rotateLeft(){}
    rotateRight(){}
}

class LTet extends Tetromino {
    constructor(center_row, center_col){
        super(center_row, center_col);

        //create references to blocks on the grid using [row of block, column of block]
        this.blocks = [[center_row, center_col], [center_row, center_col + 1],
                       [center_row - 1, center_col], [center_row - 2, center_col]];
    }
}

function spawnTetromino(){
    newTet = new LTet(2, 3);
    newTet.activate();
    currentTetromino = newTet;
}

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
            
            var prevBlock = document.getElementById(id - 1);
            document.body.insertBefore(newBlock, prevBlock);
            row.push(new Block(newBlock));
        }
        grid.push(row)
    }
    return grid;
}

function checkKey(key){
    switch (key.keyCode){
        case 38: 
            //up arrow
            break;

        case 40:
            //down arrow
            break;
        
        case 37:
            currentTetromino.moveLeft();
            break;

        case 39:
            currentTetromino.moveRight();
            break;

        case 32:
            //space
            break;
    }
}

var rows = 12;
var cols = 8;
var sideLength = 50;
var timeInterval = 1000;

let grid;
let currentTetromino;