
function GenericClient(clientType){

    this.clientType = clientType;

    var M = null;
    this.pubsub = null;

    this.setup = function(){

        M = this.getContext();

        //NETWORK
        //initialize a pubsub instance
        this.pubsub = new Mobilizing.net.PubSub();
        //transmit to the client script
        this.pubsub.events.on('connect', this.onConnect.bind(this));

        //console.info("generic client setup over");
    };

    //connection manager
    this.onConnect = function(){

        //tells the server what type we are for auto videoOrder assignement if needed
        this.pubsub.publish("/clientType", {id : this.pubsub.id,
                                            type: this.clientType});
        //project swicther to reload the corresponding page
        this.pubsub.subscribe("/switchToProject",this.onSwitchToProject.bind(this));


        this.ready = true;
        //console.info("generic client onConnect over");
    };

    //switch from one projet to an other, order coming form the server
    //incoming data format : {projectName:projectName}
    this.onSwitchToProject = function(data){

        console.log("this.clientType",this);
        console.log("generic client onSwitchToProject",data);

        if(this.clientType === "mobile"){
            location = data.mobileClientURL;
        }else if(this.clientType === "video"){
            location = data.videoClientURL;
        }

    };

    //we must disconnect immediatly on window close
    this.disconnectOnUnload = function ()
    {
        if (this.pubsub != undefined) {
            this.pubsub.publish("/disconnect");
        }
    };

    //update
    this.update = function(){

    };

    //resiter the unload disconnection
    window.addEventListener("unload", this.disconnectOnUnload.bind(this));
}
