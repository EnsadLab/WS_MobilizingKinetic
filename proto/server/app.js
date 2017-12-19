"use strict";

const fs    = require('fs');
const http  = require('http');
const https = require('https');

const commander      = require('commander');
const express        = require('express');
const flat           = require('flat');
const moment         = require('moment');
const serveIndex     = require('serve-index');
const serveStatic    = require('serve-static');
const socketio       = require('socket.io');
const socketioevents = require('socket.io-events');


/**
 * @class MobilizingServer
 * @constructor
 * @param {String} host The hostname to listen on
 * @param {Number} port The port number to listen on
 * @param {Boolean} [ssl=false] Whether to serve files in HTTPS
 * @param {Number} ssl_port The port number to listen on for HTTPS
 * @param {String} ssl_key The path to the SSL key file
 * @param {String} ssl_crt The path to the SSL crt file
 * @param {String} dir A directory to serve files from
 * @param {Boolean} [log=false] Whether to log activity in a file or not
 */
function MobilizingServer(host, port, ssl, ssl_port, ssl_key, ssl_crt, dir, log)
{
    var logfile, router;

    this.app = express();

    this.server = http.createServer(this.app);
    this.server.listen(port, host);

    console.log("Listening on http://"+ host +":"+ port);

    this.io = socketio.listen(this.server);
    this.io.on('connection', this.onConnect.bind(this));

    if(ssl)
    {
        try{
            this.ssl_server = https.createServer({
                'key': fs.readFileSync(ssl_key),
                'cert': fs.readFileSync(ssl_crt)
            }, this.app).listen(ssl_port);

            console.log("Listening on https://"+ host +":"+ port);
        }
        catch(e)
        {
            console.log('\n-----------------------------------------------------------');
            console.log('The ssl key and/or certidicate could not be found or are not valid.');
            console.log('Please follow the simple steps below to generate a self-signed ssl certificate:');
            console.log('------------------------------------------------------------');
            console.log('Step 1. Generate a Private Key:');
            console.log('openssl genrsa -des3 -out ssl.key 1024 \n');
            console.log('Step 2. Generate a CSR (Certificate Signing Request):');
            console.log('openssl req -new -key ssl.key -out ssl.csr \n');
            console.log('Step 3. Remove Passphrase from Key:');
            console.log('openssl rsa -in ssl.key -out ssl.key \n');
            console.log('Step 4. Generating a Self-Signed Certificate:');
            console.log('openssl x509 -req -days 365 -in ssl.csr -signkey ssl.key -out ssl.crt \n');

            process.exit();
        }
    }

    if(dir)
    {
        // Serve files
        this.app.use(serveStatic(dir, {'index': ['index.html', 'index.htm'], 'extensions': ['html', 'htm']}));

        // Serve directory indexes folder
        this.app.use('/', serveIndex(dir, {'icons': true}));

        console.log("Serving files from "+ dir);
    }

    if(log)
    {
        logfile = './logs/'+ moment().format('YYYYMMDD-HHmmss') +'.log';
        console.log("Logging to: "+ logfile);

        this.logger = fs.createWriteStream(logfile, {flags:'a'});
    }

    router = socketioevents();

    router.on((socket, args, next) => {
        var evt;

        args = Array.prototype.slice.call(args);
        evt = args.shift();

        this.log(socket, evt, args);
        next();
    });

    this.io.use(router);
}

/**
* Socket 'connect' event handler
* @method onConnect
* @param {Socket} socket The socket object
*/
MobilizingServer.prototype.onConnect = function(socket)
{
    socket.join(socket.client.id);

    socket.on('publish', this.onPublish.bind(this, socket));
    socket.on('subscribe', this.onSubscribe.bind(this, socket));
    socket.on('unsubscribe', this.onUnsubscribe.bind(this, socket));
    socket.on('disconnect', this.onDisconnect.bind(this, socket));

    this.io.to('/connect').emit('/connect', socket.client.id);

    this.log(socket, 'connection');
};

/**
* Socket 'message' event handler
* @method onMessage
* @param {Socket} socket The socket object
* @param {Object} data The data
*/
MobilizingServer.prototype.onPublish = function(socket, data)
{
    var channel = data.channel,
        message = data.message;

    this.io.to(channel).emit(channel, message);
};

/**
* Socket 'message' event handler
* @method onMessage
* @param {Socket} socket The socket object
* @param {Object} data The data
*/
MobilizingServer.prototype.onSubscribe = function(socket, data)
{
    var channel = data.channel;

    socket.join(channel);
};

/**
* Socket 'message' event handler
* @method onMessage
* @param {Socket} socket The socket object
* @param {Object} data The data
*/
MobilizingServer.prototype.onUnsubscribe = function(socket, data)
{
    var channel = data.channel;

    socket.leave(channel);
};

/**
* Socket 'disconnect' event handler
* @method onDisconnect
* @param {Socket} socket The socket object
*/
MobilizingServer.prototype.onDisconnect = function(socket)
{
    this.io.to('/disconnect').emit('/disconnect', socket.client.id);

    this.log(socket, 'disconnect');
};

/**
* Log event to file
* @method log
*/
MobilizingServer.prototype.log = function(socket, evt, data)
{
    var log = {
        'timestamp': Date.now(),
        'socket': socket.id,
        'event': evt
    };

    if(data !== undefined)
    {
        log.data = data;
    }

    if(this.logger)
    {
        this.logger.write(JSON.stringify(flat(log)) + '\n');
    }
    else
    {
        console.log(log);
    }
};


// setup commander options and parse arguments
commander.option('--host [host]', 'set the server hostname. defaults to 0.0.0.0', process.env.HOST || 'localhost');
commander.option('--port [port]', 'set the server port number. defaults to 8000', process.env.PORT || 8000);
commander.option('--dir [dir]', 'set the directory for static files');
commander.option('--ssl', 'whether to serve files in HTTPS');
commander.option('--ssl-port [port]', 'set the server ssl port number. defaults to 8080', process.env.SSL_PORT || 8080);
commander.option('--ssl-key [file]', 'path to ssl key file. defaults to ssl.key', process.env.SSL_KEY || 'ssl.key');
commander.option('--ssl-crt [file]', 'path to ssl crt file. defaults to ssl.crt', process.env.SSL_CRT || 'ssl.crt');
commander.option('--log', 'whether to save data to a log file or not');
commander.parse(process.argv);


// create the singleton server instance
new MobilizingServer(commander.host, commander.port, commander.ssl, commander.sslPort, commander.sslKey, commander.sslCrt, commander.dir, commander.log);
