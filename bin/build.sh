#!/bin/bash
mkdir -p build
pushd build > /dev/null

CC_WARNINGS="-Wall -Wextra -Wl,-map,mem.map -pedantic -Werror -Wshadow -Wstrict-overflow -fno-strict-aliasing"
CC_OPTIM="-O2 -Os -march=native"
CC_DEFINES="-DINTERNAL"

FLAGS="$CC_WARNINGS $CC_OPTIM $CC_DEFINES"

SSL_PATH="/usr/local/opt/libressl"
INC_PATH="-I ../inc -I $SSL_PATH/include"
SRC_PATH="../src"
LIB_PATH="-L $SSL_PATH/lib"
LIBS="-ltls -lssl -lcrypto"

rm -rf *

cc $FLAGS $INC_PATH $SRC_PATH/hello.c $LIB_PATH $LIBS -o hello
cp ../cfg/peron.pem ./

popd > /dev/null
