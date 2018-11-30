# Peron

Trading bot

# Building
There are 2 methods of building this app:

Modular build: Used to double check dependencies are properly defined
Unity build: Fast and simple compilation strategy

# Libraries
## LibreSSL
brew install libressl

### generate pem cert
openssl req -newkey rsa:4096 -nodes -sha512 -x509 -days 3650 -nodes -out peron.pem -keyout peron.pk

## Troubleshooting

### Missing leaks .dylib
dyld: could not load inserted library '/usr/local/lib/libLeaksAtExit.dylib' because image not found

make a symlink to it:
cd /usr/local/lib sudo ln -s /Applications/Xcode.app//Contents/Developer/usr/lib/libLeaksAtExit.dylib
