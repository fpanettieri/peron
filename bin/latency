#!/bin/bash
SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $SCRIPTDIR/auth

CMD="ping -t 100 -i 0.2 -w 3 www.bitmex.com"

for i in A B C; do
  SERVER=AWS_EUW_$i
  echo "checking $SERVER"
	ssh -t -i ~/.aws/platita-eu2.pem -o ConnectTimeout=10 ${!SERVER} $CMD
done
