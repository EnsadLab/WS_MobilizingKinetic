/*
 * Ce serveur s'occupe de gérer l'ensemble des requêtes et relie tout les appareils clients entre eux.
 */
function CentralServer(){

    //clients management is all project and scenario wide
    this.clients = {};

    //special case of videomapping client apps
    this.videoMappingClients = [];//FIXME
    //for simple clients tracking
    this.mobileClients = [];//FIXME

    // initialize a pubsub instance that will be shared with sub-servers
    this.pubsub = new Mobilizing.net.PubSub();
    this.pubsub.events.on('connect', this.onConnect.bind(this));

    //Regsiters the projects that are declared in the HTML file
    for(var i in ProjectsRepository.projects){
        var tempProject = ProjectsRepository.projects[i];
        tempProject.genericServer.setClients(this.clients);
        tempProject.genericServer.setPubsub(this.pubsub);
    }

};


/**
* Update method used to update the subserver if it needs
*
* @method update
*/
CentralServer.prototype.update = function(){

    if(this.currentProject){
        if(typeof this.currentProject.update === "function")
        {
            this.currentProject.deltaTime = this.deltaTime;
            this.currentProject.update();
        }
    }
};

/**
* Main onConnect method that is called by the pubsub
*
* @method onConnect
*/
CentralServer.prototype.onConnect = function(){

    this.pubsub.subscribe('/connect', this.onClientConnect.bind(this));
    this.pubsub.subscribe('/disconnect', this.onClientDisconnect.bind(this));

    this.pubsub.subscribe('/index/remote/client/ready', this.onRemoteClientReady.bind(this));
    this.pubsub.subscribe('/index/remote/client/switchproject', this.onRemoteClientSwitchProject.bind(this));

    //register to the client type channel
    this.pubsub.subscribe("/clientType", this.onClientType.bind(this));

    this.pubsub.subscribe("/current_project",this.onClientType.bind(this));

};

/**
* manage client type, mainly for video clients order and for mobile server and index choice.
* Allowed types are "videomapping", "mobile"
*
* for videomapping client, we defines an order for the organisation of camera/video projector if not already defined. This is unrelated to the project and scenario choice.
*
* for mobile client we transmit the url of the html file to be loaded. Usually this method is called when the mobile client starts for the 1st time, as client list is handled cross projects and scenarios
*
* @method onClientType
* @param {Object} data incoming from client
*/
CentralServer.prototype.onClientType = function(data){

    console.log("onClientType",data, this.clients);
    //set the clients type to facilitate deconnection
    if(data.id)
    {
        this.clients[data.id].type = data.type;
    }
    
    //manage video mapping special clients
    if(data.type === "video"){

        //compute the order that should be given to the new client
        var newOrderIndex = 0;
        var mustPush = true;//indicator to push or not after the search loop

        //search if a null listed client is there, so we replace it
        for(var i=0; i<this.videoMappingClients.length; i++){

            if(this.videoMappingClients[i] === null){
                this.videoMappingClients[i] = data.id;
                newOrderIndex = i;
                mustPush = false;
                break;
            }
        }
        //otherwise push it
        if(mustPush){
            this.videoMappingClients.push(data.id);
            newOrderIndex = this.videoMappingClients.length-1;
        }

        var tempToSend = this.getClientsURL();

        //and tell to the client which order it has
        this.pubsub.publish(data.id,
                            {id: data.id,
                             order: newOrderIndex,
                             videoClientURL: tempToSend.videoClientURL
                            });
        console.log("sent to", data.id);
    }else if(data.type === "mobile"){

        //this is for mobile client! We must tell him what to load to join the feast
        this.mobileClients.push(data.id);

        this.pubsub.publish(data.id, this.getClientsURL());

        console.log("mobile type enter",this.currentProject);
        //grab the sub-server for the default project and default scenario

        //launch the onConnect function of the current project and scenario server
        if(typeof this.currentProject.onConnect === "function"){
            if(this.currentProject.genericServer.ready){
                this.currentProject.onConnect();
            }
        }
    }

    //launch the onConnect function of the current project and scenario server
    if(typeof this.currentProject.onConnect === "function"){
        this.currentProject.onConnect();
    }

    //launch the onClientConnect of the subserver if exists
    if(typeof this.currentProject.onClientConnect === "function"){
        console.log("call onClientConnect");
        this.currentProject.onClientConnect(data.id);
    }
};

/**
* Switch method to a specific project and scenario. Default declared in projectList are used if projectScenario is undefined.
* We must also manage the subservers onConnect in here, so it has a chance to be executed at launch.
*
* @method switchToProject
* @param {String} projectName the project name to switch to
* @param {String} projectScenario Default declared in projectList is used if undefined
*/
CentralServer.prototype.switchToProject = function(projectName){


    try{

        this.currentProject.quit();

        //console.log(this.projectServer.quit);
        //update the local fields, so that we can use them elsewhere
        this.currentProject = ProjectsRepository.getProjectByName(projectName);

        this.currentProject.start();

        if(!this.currentProject){
            console.error("!wrong project name",projectName);
        }

        console.log("switchToProject from dispatcher",this.currentProject.genericServer.name);


        //informs the client that it should switch to this i.e : gives the url of the hmtl file to load

        this.pubsub.publish("/switchToProject", this.getClientsURL());

        //launch the onConnect function of the current project and scenario server
        //remerber : this is a switch, we must start over but the clients are already managed!
        /*if(typeof this.currentProject.onConnect === "function"){
            this.currentProject.onConnect();
        }
        //launch the onClientConnect of the subserver if exists
        if(typeof this.currentProject.onClientConnect === "function"){
            this.currentProject.onClientConnect();
        }*/

    }catch(e){
        console.error("exception in switch",e);
    }

};

CentralServer.prototype.getClientsURL = function(){
    var objToSend = {

        mobileClientURL:
        "/projects/" + this.currentProject.genericServer.folderName + "/mobile/index.html",

        videoClientURL :  "/projects/" + this.currentProject.genericServer.folderName + "/video/index.html"};

    console.log("objToSend",objToSend);
    return objToSend;
};


/**
 * client connection handler declared as a callback in onConnect method.
 *
 * @method onClientConnect
 * @param {String} id the socket.io connection socket id, given by the server node app.
 */
CentralServer.prototype.onClientConnect = function(id){

    console.log("onClientConnect",id);
    // add the client to the list if it doesn't already exist
    if(!(id in this.clients)){
        this.clients[id] = {};
    }

};

/**
 * disconnection handler  declared as a callback in onConnect method.  We must also manage the subservers onClientDisconnect in here.
 * @method onClientDisconnect
 */
CentralServer.prototype.onClientDisconnect = function(id){

    if(id in this.clients){

        //manage the special case of videomapping clients
        if(this.clients[id].type === "video"){

            //grab the index from the id
            var index = this.videoMappingClients.indexOf(id);
            //set it to null to free the slot and avoid wrong orders
            this.videoMappingClients[index] = null;

        }else if(this.clients[id].type === "mobile"){

            var index = this.mobileClients.indexOf(id);
            //set it to null to free the slot and avoid wrong orders
            this.mobileClients.splice(index,1);
            console.log("this.mobileClients",this.mobileClients);
        }

        //then manage the scenario specific cases
        if(this.currentProject){
            if(typeof this.currentProject.onClientDisconnect === "function"){
                this.currentProject.onClientDisconnect(id);
            }
        }
    }

    //good bye anyway
    console.log("delete ", this.clients[id],"remains",this.clients);
    delete this.clients[id];

    //special case if we have no clients at all, we should clean the subserver at least
    //    if( this.mobileClients.length === 0){
    //        console.warn("no more mobile clients are there");
    //
    //        this.currentProject.quit();
    //    }

};

CentralServer.prototype.onRemoteClientReady = function(){
    var projects = [];

    for(var i in ProjectsRepository.projects){
        projects.push(ProjectsRepository.projects[i].genericServer.name);
    }

    this.pubsub.publish("/index/remote/projects", projects);
};

CentralServer.prototype.onRemoteClientSwitchProject = function(project){
    this.switchToProject(project);
};

CentralServer.prototype.quitCurrentProject = function(){
    this.currentProject.quit();
};


