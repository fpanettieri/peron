build.sh

pushd build > /dev/null
leaks -nocontext -nostacks -quiet -atExit -exclude tls_init -- ./hello
popd > /dev/null
