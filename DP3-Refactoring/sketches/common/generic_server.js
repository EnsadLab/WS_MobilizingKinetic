/**
* GenericServer used for sub-server and scenario specifics
*
* @class GenericServer
*/
function GenericServer(){

    this.name = "none";
    this.folderName = "none";

    this.ready = false;
};

GenericServer.prototype.setClients = function(clients){
    this.clients = clients;
};

GenericServer.prototype.setPubsub = function(pubsub){
    this.pubsub = pubsub;
};

GenericServer.prototype.onConnect = function(){
    console.log("GenericServer.prototype.onConnect");
    this.ready = true;
};

GenericServer.prototype.quit = function(){

    this.ready = false;
};
