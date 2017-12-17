#!/bin/sh
BASEDIR=$(dirname $0)
cd $BASEDIR

echo current working path is : $PWD
echo will set the base server directory to : $BASEDIR/..

sudo node app.js --host c3m.local --dir $BASEDIR/.. --port 80
