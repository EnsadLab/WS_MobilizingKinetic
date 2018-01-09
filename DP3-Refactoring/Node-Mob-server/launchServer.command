#!/bin/sh
BASEDIR=$(dirname "$0")
echo "basedir is $BASEDIR"

cd "$BASEDIR"

node app.js --host dommacbookproi7.local --dir "$BASEDIR/.." --port 8888