#!/bin/bash
SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $SCRIPTDIR/auth

echo "Deploying new version"
rsync -av src ${!AWS_SERVER}:peron
echo "New version deployed"
