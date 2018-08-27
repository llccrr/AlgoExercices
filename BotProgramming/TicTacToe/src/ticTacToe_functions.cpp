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
    cerr << "Starting minimax..." << endl;
    t_move result;
    int isWon = winChecking(board, availableIndexes);

    if (isWon != -1) {
        result.score = isWon;
        return result;
    }

    vector<t_move> moves;
    t_move move;
    
    for (int i = 0; i < availableIndexes.size(); ++i) {
        // updating the board with the next move
        board[availableIndexes[i]] = isMe ? ME_SYMBOL : OP_SYMBOL;
        move.index = availableIndexes[i];
        result = minimax(board, availableIndexes, !isMe);
        move.score = result.score;
        board[availableIndexes[i]] = move.index;
        moves.push_back(move);
    }

    cerr << move.index << endl;

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


