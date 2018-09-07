#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <time.h>
#include <chrono>
using namespace std;

#define OP_SYMBOL 'O'
#define ME_SYMBOL 'X'

typedef struct move {
    int index;
    int score;
} t_move;


template<typename T>
void printVector(const T& vec) {
    std::copy(vec.cbegin(), vec.cend(), std::ostream_iterator<typename T::value_type>(std::cout, ", "));
}
 
   
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
    // cerr << " --- " << endl;
    // cerr << "Starting minimax for me..." << (isMe ? "true" : "false") << endl;   
    
    t_move result;
    vector<t_move> moves;
    t_move move;

    int isWon = winChecking(board, availableIndexes);

    // if there is a winner, return a move with the score, else continue
     if (isWon != -1) {
         // cerr <<"isWon: " << isWon;
        result.score = isWon;
        return result;
    }


    for (int i = 0; i < availableIndexes.size(); ++i) {
        //cerr << "for -> i: " << i << endl;
        // updating the board with the next move
        // vector<char> newBoard = board;
        // vector<int> newAvailableIndexes = availableIndexes;
        //cout << "index avai" << availableIndexes[i] << endl;
        board[availableIndexes[i]] = (isMe ? ME_SYMBOL : OP_SYMBOL);
        //cout << "new Board: ";
        //printVector(newBoard);
        //cout << endl;
        move.index = availableIndexes[i];
        //newAvailableIndexes[i] = -1;
        // cerr << "index: " << move.index << endl;
        availableIndexes.erase(availableIndexes.begin() + i);
        result = minimax(board, availableIndexes, !isMe);
        move.score = result.score;
        // cerr << "score: " << move.score << endl;
        
        moves.push_back(move);
        //cerr<< "là: " <<endl;
    }

    //cerr << "move index" << move.index << endl;

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

vector<int> mutateVector(vector<int> vec) {
    vec.push_back(2);
    return vec;
}
// O - -
// O X X
// - - -
int main()
{
    auto start = chrono::steady_clock::now();
    /* Do your stuff here */
    char boardList[9] = {'O', '?', '?', '?', '?', '?', '?', '?', '?'};
    //char boardList[9] = {'O', '?', '?', 'O', 'X', 'X', '?', '?', '?'};
    vector<char> board(boardList, boardList + sizeof(boardList) / sizeof(char));

    int randomList[9] = { 1, 2, 3, 4, 5, 6, 7, 8 };
    // int randomList[9] = { 1, 2, 6, 7, 8 };
    vector<int> availableIndexes(randomList, randomList + sizeof(randomList) / sizeof(int));


    t_move chosenMove = minimax(board, availableIndexes, true);
    cout << "chosenMove: " << chosenMove.index << endl;
    auto end = chrono::steady_clock::now();
    auto diff = end - start;
    cout << chrono::duration <double, milli> (diff).count() << " ms" << endl;

    return 0;

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