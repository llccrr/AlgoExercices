cmake_minimum_required(VERSION 2.6)

set(EXECUTABLE_OUTPUT_PATH ..)

include_directories(src)

# GOOGLE TEST
# Download and unpack googletest at configure time
configure_file(CMakeLists.txt.in googletest-download/CMakeLists.txt)
execute_process(COMMAND ${CMAKE_COMMAND} -G "${CMAKE_GENERATOR}" .
  RESULT_VARIABLE result
WORKING_DIRECTORY ${CMAKE_BINARY_DIR}/test/googletest-download )
if(result)
  message(FATAL_ERROR "CMake step for googletest failed: ${result}")
endif()
execute_process(COMMAND ${CMAKE_COMMAND} --build .
  RESULT_VARIABLE result
WORKING_DIRECTORY ${CMAKE_BINARY_DIR}/test/googletest-download )
if(result)
  message(FATAL_ERROR "Build step for googletest failed: ${result}")
endif()

# Prevent overriding the parent project's compiler/linker
# settings on Windows
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)

# Add googletest directly to our build. This defines
# the gtest and gtest_main targets.
add_subdirectory(${CMAKE_BINARY_DIR}/googletest-src
                 ${CMAKE_BINARY_DIR}/googletest-build)

# The gtest/gtest_main targets carry header search path
# dependencies automatically when using CMake 2.8.11 or
# later. Otherwise we have to add them here ourselves.
if (CMAKE_VERSION VERSION_LESS 2.8.11)
  include_directories("${gtest_SOURCE_DIR}/include")
endif()

# UNIT TESTS
enable_testing()

# Generation of the list of the source files
file(
	GLOB_RECURSE
	TEST_SOURCE_FILES
  RELATIVE
  ${CMAKE_CURRENT_SOURCE_DIR}
	*.cc
)

# Iterate over all tests found. For each, declare an executable and add it to the tests list.
#foreach(FILE ${TEST_SOURCE_FILES})
#    string(REGEX REPLACE "[./]" "_" NAME ${FILE}) # create exe name
#    add_executable(${NAME} ${FILE})
#    target_link_libraries(${NAME} ${PROJECT_NAME}_lib gtest gtest_main) # link against our lib and boost test
#    add_test(NAME ${NAME} COMMAND ${NAME})                              # this is how to add tests to CMake
#endforeach(FILE ${TEST_SOURCE_FILES})

add_executable(${PROJECT_NAME}_test ${TEST_SOURCE_FILES})
target_link_libraries(${PROJECT_NAME}_test ${PROJECT_NAME}_lib gtest gtest_main)
add_test(ticTacToe.ia_test ${PROJECT_BINARY_DIR}/${PROJECT_NAME}_test)


# COVERAGE
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g -O0 -fprofile-arcs -ftest-coverage")

add_custom_target(
  coverage
  COMMAND lcov --zerocounters  --directory .
  COMMAND ${PROJECT_NAME}_test
  COMMAND lcov --directory . --capture --output-file ${PROJECT_NAME}.info
  COMMAND lcov --extract ${PROJECT_NAME}.info "*/src/*" "*/test/*" -o ${PROJECT_NAME}.info
  COMMAND genhtml --output-directory ../coverage --demangle-cpp --num-spaces 2 --sort --title "My Program's Test Coverage" --function-coverage --branch-coverage --legend ${PROJECT_NAME}.info
  WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}
  COMMENT "Generating coverage repport with gcov and lcov"
  VERBATIM
)
