pushd build > /dev/null
leaks -atExit -- ./hello
popd > /dev/null
