#!/bin/bash
SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $SCRIPTDIR/auth

echo "Running ssh ${!AWS_SERVER}"
ssh ${!AWS_SERVER}
