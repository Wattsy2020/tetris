// moves entire rows down at a time after rows have been cleared
function moveRowsDown(){
    let downAmount = 0; // amount to move rows down by
    for (let i = rows - 1; i >= 0; i--){
        if (rowEmpty(grid[i])){
            downAmount += 1;
        }
        else{ // move row down by downAmount
            for (let j = 0; j < grid[i].length; j++){
                if (grid[i][j].isOn()){
                    let color = grid[i][j].getColor();
                    grid[i][j].turnOff();
                    grid[i+downAmount][j].turnOn(color);
                }
            }
        }
    }
}

function updateScore(rowsCleared){
    let points = Math.pow(rowsCleared, 2)*1000;
    scoreText.textContent = parseInt(scoreText.textContent) + points;
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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createTetromino(){
    let color = colors[getRandomInt(0, colors.length - 1)];
    let newTet;
    let type = getRandomInt(0, 6);

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

    newTet.calculatePreview();
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
        case 90:
            // swap the next tetromino with the one in the storage box
            newTet.turnOffPreview(nextBlockGrid);
            storeTet.turnOffPreview(storageBlockGrid);
            newTet.showPreview(storageBlockGrid);
            storeTet.showPreview(nextBlockGrid);

            let temp = newTet;
            newTet = storeTet;
            storeTet = temp;
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
    // construct list of blocks that are turned on
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
        grid.forEach(row => clearRow(row));
        currentTetromino.turnOffHighlight();

        clearInterval(currentTetromino.fallSchedule);
        paused = false;
    }
    storeTet.turnOffPreview(storageBlockGrid);
    storeTet = createTetromino();
    storeTet.showPreview(storageBlockGrid);

    scoreText.textContent = "0";
    overlay.style.visibility = "hidden";
    gameLoop();
}

function gameLoop(){
    if (!newTet.gameOver()){
        newTet.turnOffPreview(nextBlockGrid);
        newTet.activate();
        currentTetromino = newTet;

        newTet = createTetromino();
        newTet.showPreview(nextBlockGrid);
    }
    else{
        // flash Tetromino
        let turnOff = function(){newTet.turnOffBlocks();};
        let turnOn = function(){newTet.turnOnBlocks(newTet.blocks);};

        turnOn();
        setTimeout(turnOff, 500);
        setTimeout(turnOn, 1000);
        setTimeout(turnOff, 1500);
        setTimeout(turnOn, 2000);
        
        // remove every block one by one, once finished display the Game Over Screen
        setTimeout(clearGrid, 2500); 
    }
}

const colors = ["Aqua", "DarkOrange", "DeepPink", "Fuchsia", "Red", "Blue", "Lime", "Green"];

// used for Game over animation
let clearBlockSchedule;
let toClear;
let blockCounter;

let currentTetromino;
let paused = false;