#include "gtest/gtest.h"
#include "../src/ticTacToe_functions.cpp"
#include <iostream>
#include <vector>
using namespace std;


TEST(mandatory_test, losingBoard)
{

      char boardList[9] = {'X', 'O', 'X', 'O', 'O', 'O', 'O', '?', '?'};
    vector<char> board(boardList, boardList + sizeof(boardList) / sizeof(char));

    int randomList[9] = { 0, 1, 2 ,3, -1, -1, -1, -1, -1 };
    vector<int> availableIndexes(randomList, randomList + sizeof(randomList) / sizeof(int));


    int score = winChecking(board, availableIndexes);

  EXPECT_EQ(score, -10);
}

TEST(winChecking1, noWinner)
{

    char boardList[9] = {'X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'};
    vector<char> board(boardList, boardList + sizeof(boardList) / sizeof(char));

    int randomList[9] = { 0, 1, 2 ,3, -1, -1, -1, -1, -1 };
    vector<int> availableIndexes(randomList, randomList + sizeof(randomList) / sizeof(int));


    int score = winChecking(board, availableIndexes);

  EXPECT_EQ(score, -1);
}
TEST(minimax, noMovesYet)
{

    char boardList[9] = {'?', '?', '?', '?', '?', '?', '?', '?', '?'};
    vector<char> board(boardList, boardList + sizeof(boardList) / sizeof(char));

    int randomList[9] = { 0, 1, 2 ,3, 4, 5, 6, 7, 8 };
    vector<int> availableIndexes(randomList, randomList + sizeof(randomList) / sizeof(int));


    t_move chosenMove = minimax(board, availableIndexes, true);

  EXPECT_EQ(chosenMove.index, 0);
}

int main(int argc, char** argv)
{
  testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}
