#!/bin/sh
BASEDIR=$(dirname "$0")
echo "basedir is $BASEDIR"

cd "$BASEDIR"

node app.js --host 127.0.0.1 --dir "$BASEDIR/.." --port 8888