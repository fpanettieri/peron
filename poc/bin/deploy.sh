#!/bin/bash
npm pack
scp -i $AWS_PEM peron-poc*.tgz $AWS_EC2:
rm peron-poc*.tgz
