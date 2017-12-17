#!/bin/sh
BASEDIR=$(dirname $0)
cd $BASEDIR

echo current working path is : $PWD
echo will set the base server directory to : $BASEDIR/..

node app.js --host 192.168.1.231 --dir $BASEDIR/.. --port 8888