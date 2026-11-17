"use strict";
function runInside() {
    const board = document.querySelector(".board");
    const score = document.querySelector(".score");
    if (!board || !score)
        throw new Error("Board or score element not found");
    const boxSide = 30;
    const cols = Math.floor(board.clientWidth / boxSide);
    const rows = Math.floor(board.clientHeight / boxSide);
    if (cols < 1 || rows < 1)
        throw new Error("Board is too small to create a game grid");
    const boardCells = {};
    const snakeCoor = [{ x: Math.min(1, cols - 1), y: Math.min(1, rows - 1) }];
    let direction = "right";
    let nextDirection = "right";
    let initScore = 0;
    const cellKey = ({ x, y }) => `${x}-${y}`;
    const isSameCell = (first, second) => first.x === second.x && first.y === second.y;
    const isOpposite = (first, second) => (first === "right" && second === "left") || (first === "left" && second === "right") ||
        (first === "up" && second === "down") || (first === "down" && second === "up");
    board.replaceChildren();
    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            boardCells[`${x}-${y}`] = cell;
            board.append(cell);
        }
    }
    const placeFood = () => {
        const availableCells = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const candidate = { x, y };
                if (!snakeCoor.some((segment) => isSameCell(segment, candidate)))
                    availableCells.push(candidate);
            }
        }
        if (!availableCells.length)
            throw new Error("You win!");
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    };
    let foodCoor = placeFood();
    boardCells[cellKey(snakeCoor[0])].classList.add("snakePart");
    boardCells[cellKey(foodCoor)].classList.add("food");
    const endGame = (message) => {
        clearInterval(gameInt);
        score.textContent = `Score: ${initScore} — ${message}`;
    };
    const gameInt = window.setInterval(() => {
        direction = nextDirection;
        const currentHead = snakeCoor[0];
        const nextHead = { ...currentHead };
        if (direction === "right")
            nextHead.x++;
        else if (direction === "left")
            nextHead.x--;
        else if (direction === "up")
            nextHead.y--;
        else
            nextHead.y++;
        const hitsWall = nextHead.x < 0 || nextHead.x >= cols || nextHead.y < 0 || nextHead.y >= rows;
        if (hitsWall)
            return endGame("Game over");
        const ateFood = isSameCell(nextHead, foodCoor);
        const bodyToCheck = ateFood ? snakeCoor : snakeCoor.slice(0, -1);
        if (bodyToCheck.some((segment) => isSameCell(segment, nextHead)))
            return endGame("Game over");
        snakeCoor.unshift(nextHead);
        boardCells[cellKey(nextHead)].classList.add("snakePart");
        if (ateFood) {
            initScore++;
            score.textContent = `Score: ${initScore}`;
            boardCells[cellKey(foodCoor)].classList.remove("food");
            try {
                foodCoor = placeFood();
                boardCells[cellKey(foodCoor)].classList.add("food");
            }
            catch {
                endGame("You win!");
            }
        }
        else {
            const tail = snakeCoor.pop();
            if (tail)
                boardCells[cellKey(tail)].classList.remove("snakePart");
        }
    }, 500);
    document.addEventListener("keydown", (event) => {
        const directions = {
            ArrowRight: "right", ArrowLeft: "left", ArrowUp: "up", ArrowDown: "down"
        };
        const requestedDirection = directions[event.key];
        if (!requestedDirection)
            return;
        event.preventDefault();
        if (!isOpposite(direction, requestedDirection))
            nextDirection = requestedDirection;
    });
}
runInside();
