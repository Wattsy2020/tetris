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

    // used to display an outline of where a tetromino would fall
    highlight(){
        this.blockE.style.outline = "none";
        this.blockE.style.boxShadow = "0 0 10px blue inset";
    }

    turnOffHighlight(){
        this.blockE.style.boxShadow = "none";
        this.blockE.style.border = "3px solid black";
    }
}

class Tetromino {
    constructor(center_row, center_col, color){
        this.center_row = center_row;
        this.center_col = center_col;
        this.color = color; 
        this.blocks = [];
        this.futureBlocks = [];
        this.previewPosition = [];
    }

    // checks if placing the tetromino is not possible i.e. game is over
    gameOver(){
        return this.blocks.some(pos => grid[pos[0]][pos[1]].isOn());
    }

    calculatePreview(){ 
        // translate the tetrominoes blocks so that their center is at 1, 0
        this.previewPosition = this.blockDistanceFromCenter(this.blocks);
        this.previewPosition = this.blockDistanceFromCenter(this.previewPosition, [1, 0]);
    }

    showPreview(grid){
        this.previewPosition.forEach(pos => grid[pos[0]][pos[1]].turnOn(this.color));
    }

    turnOffPreview(grid){
        this.previewPosition.forEach(pos => grid[pos[0]][pos[1]].turnOff());
    }

    // turns on the tetromino (only used once after initialisation)
    activate(){
        this.switchPosition(this.blocks);

        // start moving the tetromino
        let t = this;
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
        let outside = positions.some(pos => pos[0] < 0 || pos[0] >= rows || pos[1] < 0 || pos[1] >= cols);
        if (outside){return false;}

        // check if block overlaps with another block from a different tetromino
        let overlap = positions.some(pos => grid[pos[0]][pos[1]].isOn() && !this.included(pos));
        return !overlap;
    }

    turnOffBlocks(){
        this.blocks.forEach(pos => grid[pos[0]][pos[1]].turnOff());
    }

    turnOnBlocks(blocks){
        blocks.forEach(pos => grid[pos[0]][pos[1]].turnOn(this.color));
    }

    turnOffHighlight(){
        if (this.futureBlocks != null){
            this.futureBlocks.forEach(pos => grid[pos[0]][pos[1]].turnOffHighlight());
        }
    }

    turnOnHighlight(blocks){
        blocks.forEach(pos => {
            if (!this.included(pos)){
                grid[pos[0]][pos[1]].highlight();
            }
        });
    }

    // update the block positions and the highlight of the future positions
    switchPosition(newPositions){
        this.turnOffBlocks();
        this.turnOnBlocks(newPositions);
        this.blocks = newPositions;

        this.turnOffHighlight();
        this.futureBlocks = this.futurePosition();
        this.turnOnHighlight(this.futureBlocks);
    }

    mapDownwards(grid){
        return grid.map(pos => [pos[0] + 1, pos[1]]);
    }

    moveDown(){
        if (paused){return;}

        let newPositions = this.mapDownwards(this.blocks);

        if (this.noCollision(newPositions)){
            this.center_row += 1;
            this.switchPosition(newPositions);
        }

        else{
            currentTetromino = null;
            clearInterval(this.fallSchedule);

            // clear any full rows and increment score
            let numCleared = 0;
            grid.forEach(row => {
                if (rowFull(row)){
                    clearRow(row);
                    numCleared++;
                }
            });
            updateScore(numCleared);

            // move rows down into place and call gameLoop by raising an event
            setTimeout(moveRowsDown, 200);
            setTimeout(function(){mainGridContainer.dispatchEvent(lockedInPlace);}, 300);
        }
    }

    moveLeft(){
        let newPositions = this.blocks.map(pos => [pos[0], pos[1] - 1]);

        if (this.noCollision(newPositions)){
            this.center_col -= 1;
            this.switchPosition(newPositions);
        }
    }

    moveRight(){
        let newPositions = this.blocks.map(pos => [pos[0], pos[1] + 1]);

        if (this.noCollision(newPositions)){
            this.center_col += 1;
            this.switchPosition(newPositions);
        }
    }

    // drop the object by increasing the speed it falls
    drop(){
        clearInterval(this.fallSchedule);
        let t = this;
        this.fallSchedule = setInterval(function(){t.moveDown();}, timeInterval/100);
    }

    // calculate where the tetromino would be if it fell straight down from its current position
    futurePosition(){
        let previous = this.blocks;
        let futureBlocks = previous;
        while (this.noCollision(futureBlocks)){
            previous = futureBlocks;
            futureBlocks = this.mapDownwards(futureBlocks);
        }
        return previous;
    }

    // converts the location of the Tetrominos blocks on the grid into
    // the location of the blocks from the center of the Tetromino
    // also performs the reverse operation
    blockDistanceFromCenter(blocks, center=[this.center_row, this.center_col]){
        return blocks.map(pos => [center[0] - pos[0], center[1] - pos[1]]);
    }

    // rotate a Tetromino around it's center (direction = -1 means anti clockwise)
    // uses the fact that if the dot product of two vectors is 0 they are perpendicular
    rotate(direction){
        let centerDistances = this.blockDistanceFromCenter(this.blocks);
        let rotated = centerDistances.map(pos => [-direction*pos[1], direction*pos[0]]);

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

    // need to shift all blocks to the right by one to fit in the preview box
    calculatePreview(){
        super.calculatePreview();
        this.previewPosition = this.previewPosition.map(pos => [pos[0], pos[1] + 1]);
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

const timeInterval = 1000;
let lockedInPlace = new CustomEvent("lockedInPlace"); // track when a block is locked into place