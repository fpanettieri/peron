# Peron

Trading bot

# Libraries
## LibreSSL
brew install libressl

### generate pem cert
openssl req -newkey rsa:4096 -nodes -sha512 -x509 -days 3650 -nodes -out peron.pem -keyout peron.pk

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

### Missing leaks .dylib
dyld: could not load inserted library '/usr/local/lib/libLeaksAtExit.dylib' because image not found

make a symlink to it:
cd /usr/local/lib sudo ln -s /Applications/Xcode.app//Contents/Developer/usr/lib/libLeaksAtExit.dylib
