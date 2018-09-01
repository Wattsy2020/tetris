const sideLength = 40;
let lengthStr = sideLength+"px";


// dynamically create a grid of divs with CSS class block
// then create Blocks and add them to the grid so they can be manipulated by js
function createGrid(container, rows, cols){
    let grid = [];
    for (let i = 0; i < rows; i++){
        let row = [];
        for (let j = 0; j < cols; j++){
            let newBlock = document.createElement("div");
            newBlock.className = "block";
            
            newBlock.style.width = lengthStr;
            newBlock.style.height = lengthStr;
            newBlock.style.top = i*sideLength;
            newBlock.style.left = j*sideLength;
            
            container.appendChild(newBlock);
            row.push(new Block(newBlock));
        }
        grid.push(row)
    }

    container.style.width = (cols*sideLength) + "px";
    container.style.height = (rows*sideLength) + "px";
    return grid;
}