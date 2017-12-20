#!/bin/sh
BASEDIR=$(dirname "$0")
echo "basedir is $BASEDIR"

cd "$BASEDIR"

node app.js --host 0.0.0.0 --dir "$BASEDIR/.." --port 8888