#!/bin/bash
SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $SCRIPTDIR/../cfg/aws

ALL=0.0.0.0/0
IP=$(curl -s v4.ifconfig.co | awk '{ print $0 "/32" }')

echo "Attempting to open port 22"
aws ec2 revoke-security-group-ingress --group-id $AWS_SG --protocol tcp --port 22 --cidr $IP
aws ec2 authorize-security-group-ingress --group-id $AWS_SG --protocol tcp --port 22 --cidr $IP
echo "SSH port 22 open"
