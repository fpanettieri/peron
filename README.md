# Peron

Trading bot

# Libraries

## LWS
### Building
brew install openssl
mkdir build
cd build

export OPENSSL_ROOT_DIR=/usr/local/opt/openssl/
cmake .. -DLIB_SUFFIX=64
make -j4
sudo make install

# update the libraries cache
sudo update_dyld_shared_cache

## Troubleshooting
