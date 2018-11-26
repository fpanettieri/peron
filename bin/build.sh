#!/bin/bash
mkdir -p build
pushd build > /dev/null

export CC_WARNINGS="-Wall -Wextra -Wl,-map,mem.map -pedantic -Werror -Wshadow -Wstrict-overflow -fno-strict-aliasing"
export CC_OPTIM="-O2 -Os -march=native"
export CC_DEFINES="-DINTERNAL"

FLAGS="$CC_WARNINGS $CC_OPTIM $CC_DEFINES"
INC_PATH="-I../inc"
SRC_PATH="../src"
LIB_PATH=""
LIBS=""

rm -rf *

cc $FLAGS $INC_PATH $SRC_PATH/hello.c $LIB_PATH $LIBS -o hello

popd > /dev/null
