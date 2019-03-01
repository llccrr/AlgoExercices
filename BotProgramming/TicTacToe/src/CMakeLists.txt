cmake_minimum_required(VERSION 2.6)

set(EXTENSION cpp)
set(MAIN ticTacToe.ia)

set(EXECUTABLE_OUTPUT_PATH ..)

if(CMAKE_COMPILER_IS_GNUCXX)
    add_definitions(-Wall -Wno-deprecated -pthread -Wno-unknown-pragmas -Wno-sign-compare -Wwrite-strings -Wno-unused)
endif()

# Generation of the list of the source files
file(
	GLOB_RECURSE
	SOURCE_FILES
	*.${EXTENSION}
)
list(REMOVE_ITEM SOURCE_FILES ${MAIN}.${EXTENSION})

add_library(${PROJECT_NAME}_lib ${SOURCE_FILES})

# Declaration of the executable
add_executable(
	${PROJECT_NAME}
	${MAIN}.${EXTENSION}
)

# Link libraries
# The math.h library
#target_link_libraries(${PROJECT_NAME} ${PROJECT_NAME}_lib m)
target_link_libraries(${PROJECT_NAME} ${PROJECT_NAME}_lib)
