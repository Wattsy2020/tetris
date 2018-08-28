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
        var flag = false;

        this.blocks.every(pos => {
            if (pos[0] == position[0] && pos[1] == position[1]){
                flag = true;
                return false;
            }
        });
        return flag;
    }

    // returns false if a new configuration of blocks would overlap with another block
    // or go outside the grid, otherwise returns true
    noCollision(positions){
        var flag = true;

        positions.every(pos => {
            //check if block is outside the grid
            if (pos[0] < 0 || pos[0] >= rows || pos[1] < 0 || pos[1] >= cols){
                flag = false;
                return false;
            }

            //check if block overlaps with another block from a different tetromino
            if (grid[pos[0]][pos[1]].isOn() && !this.included(pos)){
                flag = false;
                return false;
            }
        });
        return flag;
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

    }

    moveRight(){

    }

    rotateLeft(){

    }

    rotateRight(){

    }

    //move the tetronimo down until it hits another block
    drop(){
        
    }
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
    tetrominos.push(newTet);
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

var rows = 12;
var cols = 8;
var sideLength = 50;
var timeInterval = 1000;

var tetrominos = [];
let grid;