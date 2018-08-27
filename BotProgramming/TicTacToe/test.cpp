#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

#define OP_SYMBOL 'O'

#define ME_SYMBOL 'X'

typedef struct move {
    int index;
    int score;
} t_move;

// test -> OK
bool winning(vector<char> board, char player) {
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

// test -> OK
int winChecking(vector<char> board, vector<int> availableIndexes) {
    if (winning(board, OP_SYMBOL)) {
        return  -10;
    } else if (winning(board, ME_SYMBOL)) {
        return  10;
    } else if (availableIndexes.size() == 0) {
        return  0;
    }
    return -1;
}

t_move minimax(vector<char> board, vector<int> availableIndexes, bool isMe) {
    cerr << "Starting minimax for me..." << isMe << endl;
    t_move result;
    int isWon = winChecking(board, availableIndexes);

    // print Board
    for (vector<char>::const_iterator i = board.begin(); i != board.end(); ++i) {
        std::cout << *i << ' ';
    }

    if (isWon != -1) {
        result.score = isWon;
        return result;
    }
    cerr << "isWon: " << isWon << endl;

    vector<t_move> moves;
    t_move move;
    cout << "availableIndexes: ";
    for (vector<int>::const_iterator i = availableIndexes.begin(); i != availableIndexes.end(); ++i) {
            std::cout  << *i << ' ';
    }
    cout << endl;

    for (int i = 0; i < availableIndexes.size(); ++i) {
        cerr << "ici: " << i << endl;
        // updating the board with the next move
        vector<char> newBoard = board;
        vector<int> newAvailableIndexes = availableIndexes;

        newBoard[availableIndexes[i]] = (isMe ? ME_SYMBOL : OP_SYMBOL);
        
        move.index = availableIndexes[i];
        newAvailableIndexes[i] = -1;
        result = minimax(newBoard, newAvailableIndexes, !isMe);
        cerr << "result: " << result.score << endl;
        move.score = result.score;
        
        moves.push_back(move);
        cerr<< "là: " <<endl;
    }

    cerr << "move index" << move.index << endl;

    int bestMove;
    if (isMe) {
        int bestScore = -10000;
        for (int i = 0; i < moves.size(); ++i) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        // else loop over the moves and choose the move with the lowest score
        int bestScore = 10000;
        for (int i = 0; i < moves.size(); ++i) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];

}


int main()
{
   char boardList[9] = {'?', '?', '?', '?', '?', '?', '?', '?', '?'};
    vector<char> board(boardList, boardList + sizeof(boardList) / sizeof(char));

    int randomList[9] = { 0, 1, 2 ,3, 4, 5, 6, 7, 8 };
    vector<int> availableIndexes(randomList, randomList + sizeof(randomList) / sizeof(int));


    t_move chosenMove = minimax(board, availableIndexes, true);
    // game loop
    // while (1) {
    //     int opponentRow;
    //     int opponentCol;
    //     cin >> opponentRow >> opponentCol; cin.ignore();
    //     int validActionCount;
    //     cin >> validActionCount; cin.ignore();
    //     for (int i = 0; i < validActionCount; i++) {
    //         int row;
    //         int col;
    //         cin >> row >> col; cin.ignore();
    //     }

    //     // Write an action using cout. DON'T FORGET THE "<< endl"
    //     // To debug: cerr << "Debug messages..." << endl;

    //     cout << "0 0" << endl;
    // }
}