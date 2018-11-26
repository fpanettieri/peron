#!/bin/bash
SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $SCRIPTDIR/auth

CMD="cd peron; python src/hello.py"

ssh -t -i ~/.aws/platita-eu2.pem ${!AWS_SERVER} $CMD
