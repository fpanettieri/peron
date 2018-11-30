pushd build > /dev/null
valgrind --leak-check=full ./hello
popd > /dev/null
