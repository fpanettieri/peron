build.sh

pushd build > /dev/null
leaks -nocontext -nostacks -quiet -atExit -- ./hello
popd > /dev/null
