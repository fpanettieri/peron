# Peron

Trading bot

# Libraries

## LibreSSL


### Troubleshooting
https://medium.com/@timmykko/using-openssl-library-with-macos-sierra-7807cfd47892
clang -x c -v -E /dev/null

## LWS
### Building
mkdir build
cd build

export OPENSSL_ROOT_DIR=/usr/local/opt/openssl/
cmake .. -DLIB_SUFFIX=64
make -j4
sudo make install

# update the libraries cache
sudo update_dyld_shared_cache

## Troubleshooting
