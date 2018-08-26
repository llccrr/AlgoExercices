// winning combinations
function winning(board, player) {
    if (
        (board[0] == player && board[1] == player && board[2] == player) ||
        (board[3] == player && board[4] == player && board[5] == player) ||
        (board[6] == player && board[7] == player && board[8] == player) ||
        (board[0] == player && board[3] == player && board[6] == player) ||
        (board[1] == player && board[4] == player && board[7] == player) ||
        (board[2] == player && board[5] == player && board[8] == player) ||
        (board[0] == player && board[4] == player && board[8] == player) ||
        (board[2] == player && board[4] == player && board[6] == player)
    ) {
        return true;
    } else {
        return false;
    }
}
const emptyIndexies = board => board.filter(it => it != "O" && it != "X");

function winChecking(newBoard, opSymbol, meSymbol, availSpots) {
    if (winning(newBoard, opSymbol)) {
        return { score: -10 };
    } else if (winning(newBoard, meSymbol)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }
    return "not yet";
}
// the main minimax function
function minimax(newBoard, playerSymbol) {
    const availSpots = emptyIndexies(newBoard);
    const isWon = winChecking(newBoard, opSymbol, meSymbol, availSpots);
    if (isWon !== "not yet") return isWon;

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = playerSymbol;
        if (playerSymbol == meSymbol) {
            const result = minimax(newBoard, opSymbol);
            move.score = result.score;
        } else {
            const result = minimax(newBoard, meSymbol);
            move.score = result.score;
        }
        newBoard[availSpots[i]] = move.index;
        moves.push(move);
    }

    // if it is the computer's turn loop over the moves and choose the move with the highest score
    let bestMove;
    if (playerSymbol === meSymbol) {
        let bestScore = -10000;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        // else loop over the moves and choose the move with the lowest score
        let bestScore = 10000;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    // return the chosen move (object) from the array to the higher depth
    return moves[bestMove];
}

function fullLog(oppX, oppY, index, board, bestSpot) {
    printErr(oppX + " " + oppY);
    printErr("opMoveIndex" + index);
    printErr("updated game: " + JSON.stringify(board, null, 2));
    printErr("bestSpot:  " + bestSpot.index);

    printErr("row: " + ~~(bestSpot.index / 3));
    printErr("col: " + (bestSpot.index % 3));
}

const opSymbol = "O";
const meSymbol = "X";
const board = [0, 1, 2, 3, 4, 5, 6, 7, 8];

while (true) {
    let inputs = readline().split(" ");
    const oppX = parseInt(inputs[0]); // row
    const oppY = parseInt(inputs[1]); // col
    const validActionCount = parseInt(readline());
    const index = oppX * 3 + oppY;

    if (index >= 0) board[index] = "O";
    const bestSpot = minimax(board, meSymbol);
    for (let i = 0; i < validActionCount; i++) {
        let inputs = readline().split(" ");
        let row = parseInt(inputs[0]);
    }
    board[bestSpot.index] = "X";
    fullLog(oppX, oppY, index, board, bestSpot);
    print("8 8");
    // print(~~(bestSpot.index / 3) + " " + (bestSpot.index % 3));
}
