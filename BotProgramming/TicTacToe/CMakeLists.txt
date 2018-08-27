cmake_minimum_required(VERSION 2.6)

# Configuration of the project
get_filename_component(ProjectId ${CMAKE_CURRENT_SOURCE_DIR} NAME)
string(REPLACE " " "_" ProjectId ${ProjectId})
project(${ProjectId})

# Proposer le mode debug
set(CMAKE_BUILD_TYPE Debug)
# On aurait pu utiliser : cmake -DCMAKE_BUILD_TYPE=Debug <path and other arguments>

# Inclure les fichiers include
include_directories(include)

add_subdirectory(src)
add_subdirectory(test)

# Additional targets to perform clang-format/clang-tidy
# Get all project files
file(GLOB_RECURSE
     ALL_SOURCE_FILES
     src/*.cpp src/*.c src/*.h test/*.cc
     )

# Adding clang-format target if executable is found
find_program(CLANG_FORMAT "clang-format")
if(CLANG_FORMAT)
  add_custom_target(
    clang-format ALL
    COMMAND /usr/bin/clang-format
    -i
    -style=file
    ${ALL_SOURCE_FILES}
    )
else()
  message(WARNING "clang-format doesn't seem to be installed. It will not be able to format. Consider installing this package.")
endif()


enable_testing()
